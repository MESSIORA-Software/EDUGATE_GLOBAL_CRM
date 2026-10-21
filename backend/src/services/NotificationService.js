import { config as defaultConfig } from '../config/index.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { NotificationEventRepository } from '../repositories/NotificationEventRepository.js';
import {
    PermanentEventError,
    resolveRecipients,
    buildNotificationRows,
} from './NotificationRecipientPolicy.js';

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const toDto = (row) => ({ ...row, is_read: row.read_at !== null });

/** Opaque cursor <-> notification_id */
export const encodeCursor = (id) => Buffer.from(String(id)).toString('base64url');

/**
 * Centralized notification service: user-facing operations AND outbox
 * processing. Business modules never touch notification tables; source events
 * are recorded by database triggers.
 *
 * Dependencies are injectable for unit tests.
 */
export function createNotificationService({
    notificationRepo = NotificationRepository,
    eventRepo = NotificationEventRepository,
    config = defaultConfig,
    now = () => Date.now(),
    random = Math.random,
} = {}) {

    const settings = () => config.notifications;

    /** Exponential backoff (30s, 60s, 120s, ... capped) with ±20% jitter. */
    function retryDelaySeconds(attempts) {
        const { retryBaseSeconds, retryMaxSeconds } = settings();
        const base = Math.min(retryBaseSeconds * 2 ** Math.max(attempts - 1, 0), retryMaxSeconds);
        return Math.round(base * (0.8 + random() * 0.4));
    }

    async function recordFailure(event, error, permanent) {
        try {
            const message = error?.message || 'unknown error';
            const status = await eventRepo.fail(
                event.event_id, event.lock_token, message,
                permanent ? 0 : retryDelaySeconds(event.attempts), permanent,
            );
            return status;
        } catch (e) {
            // Lease will expire and the event will be reclaimed — nothing is lost.
            console.error('[NotificationService] could not record failure for event', event.event_id, e.message);
            return null;
        }
    }

    return {
        // ───────────────────────── user-facing ─────────────────────────────

        /** @param {number} userId authenticated user  @param {{limit,cursor,type,read}} query (validated) */
        async list(userId, query) {
            const rows = await notificationRepo.list(userId, query);
            const hasMore = rows.length > query.limit;
            const page = hasMore ? rows.slice(0, query.limit) : rows;
            return {
                data: page.map(toDto),
                next_cursor: hasMore ? encodeCursor(page[page.length - 1].notification_id) : null,
            };
        },

        async unreadCount(userId) {
            return notificationRepo.countUnread(userId);
        },

        async markRead(userId, notificationId) {
            const updated = await notificationRepo.markRead(userId, notificationId);
            if (updated) return toDto(updated);

            // Either already read, or not this user's. 404 for both-unknown and
            // foreign IDs, so ownership cannot be probed.
            const existing = await notificationRepo.findOwned(userId, notificationId);
            if (!existing) throw httpError('Notification not found.', 404);
            return toDto(existing);
        },

        async markAllRead(userId) {
            return notificationRepo.markAllRead(userId);
        },

        // ───────────────────────── outbox processing ───────────────────────

        /** Claims and processes ONE bounded batch. Safe under overlapping invocations. */
        async processBatch() {
            const { batchSize, leaseSeconds } = settings();
            const summary = { claimed: 0, processed: 0, retried: 0, failed: 0, notifications: 0, lost_lease: 0 };

            const events = await eventRepo.claim(batchSize, leaseSeconds);
            summary.claimed = events.length;
            if (!events.length) return summary;

            const lockToken = events[0].lock_token;
            const failEvent = async (event, error, permanent) => {
                const status = await recordFailure(event, error, permanent);
                if (status === 'failed') summary.failed++;
                else if (status === 'pending') summary.retried++;
                else summary.lost_lease++;
            };

            // One lookup for the whole batch (admins + all referenced staff).
            let candidates;
            try {
                const staffIds = events.map((e) => Number(e.payload?.assigned_staff_id)).filter(Boolean);
                candidates = await eventRepo.findActiveRecipientCandidates(config.roles.adminRoleIds, staffIds);
            } catch (error) {
                for (const e of events) await failEvent(e, error, false);
                return summary;
            }

            const good = [];
            const rows = [];
            for (const event of events) {
                try {
                    const recipients = resolveRecipients(event, candidates, config.roles.adminRoleIds);
                    rows.push(...buildNotificationRows(event, recipients));
                    good.push(event);
                } catch (error) {
                    await failEvent(event, error, error instanceof PermanentEventError);
                }
            }

            if (good.length) {
                try {
                    await notificationRepo.insertBatch(rows);   // idempotent
                } catch (error) {
                    for (const e of good) await failEvent(e, error, false);
                    return summary;
                }

                try {
                    const done = await eventRepo.complete(good.map((e) => e.event_id), lockToken);
                    summary.processed += done;
                    summary.notifications += rows.length;
                } catch (error) {
                    // Notifications exist; the lease will expire, the event is
                    // reclaimed and replayed, and the unique key absorbs the replay.
                    console.error('[NotificationService] could not complete events:', error.message);
                }
            }
            return summary;
        },

        /**
         * Bounded run for one HTTP invocation: at most maxRoundsPerRun batches and
         * timeBudgetMs; stops early when the queue is empty.
         */
        async processBounded() {
            const { maxRoundsPerRun, timeBudgetMs } = settings();
            const deadline = now() + timeBudgetMs;
            const total = { rounds: 0, claimed: 0, processed: 0, retried: 0, failed: 0, notifications: 0, lost_lease: 0 };

            for (let round = 0; round < maxRoundsPerRun && now() < deadline; round++) {
                const s = await this.processBatch();
                total.rounds++;
                for (const k of ['claimed', 'processed', 'retried', 'failed', 'notifications', 'lost_lease']) total[k] += s[k];
                if (s.claimed < settings().batchSize) break;   // queue drained
            }
            return total;
        },

        async requeueFailed(limit = 100) {
            return eventRepo.requeueFailed(limit);
        },
    };
}

export const NotificationService = createNotificationService();
