import { randomUUID } from 'crypto';
import { extname } from 'path';
import { config } from '../config/index.js';
import { MediaRepository } from '../repositories/MediaRepository.js';
import { MediaStorageService } from './MediaStorageService.js';
import { roleRepository } from '../repositories/UserRoleRepository.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve whether the current user is an admin/super admin.
 * Mirrors the same pattern used in ConversationService.
 *
 * @param {Object} currentUser - JWT payload (user_id, role_id, role_name)
 * @returns {Promise<boolean>}
 */
async function isAdmin(currentUser) {
    let roleName = currentUser.role_name;

    if (!roleName && currentUser.role_id) {
        const role = await roleRepository.findById(currentUser.role_id);
        roleName = role?.role_name;
    }

    const normalized = (roleName || '').toLowerCase();
    return normalized === 'admin' || normalized === 'super admin';
}

/**
 * Derive a safe MIME-type category for organizing storage paths.
 * Never uses user-supplied values as folder names.
 */
function mimeCategory(mimeType) {
    if (mimeType.startsWith('image/'))       return 'image';
    if (mimeType.startsWith('video/'))       return 'video';
    if (mimeType.startsWith('audio/'))       return 'audio';
    if (mimeType === 'application/pdf')      return 'document';
    if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document';
    return 'other';
}

/**
 * Build a safe, unique storage object path.
 * Pattern: {category}/{YYYY}/{MM}/{uuid}{.ext}
 * The path is fully server-generated — no user input involved.
 */
function buildStoragePath(mimeType, originalName) {
    const category = mimeCategory(mimeType);
    const now      = new Date();
    const year     = now.getUTCFullYear();
    const month    = String(now.getUTCMonth() + 1).padStart(2, '0');
    const id       = randomUUID();
    const ext      = extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '') || '';
    return `${category}/${year}/${month}/${id}${ext}`;
}

// ─── MediaService ─────────────────────────────────────────────────────────────

export const MediaService = {

    /**
     * Upload a file to the configured storage provider and persist metadata.
     *
     * Failure handling:
     *   - If the file is uploaded to storage but DB insert fails, the storage
     *     object is deleted before the error is re-thrown.
     *   - This prevents silent orphaned files.
     *
     * @param {Object} currentUser - JWT payload
     * @param {Object} file        - Multer file object (buffer, mimetype, originalname, size)
     * @param {string} [provider]  - 'supabase' (default) | 'google_drive'
     * @param {string} [googleAccessToken] - Required when provider='google_drive'
     * @returns {Promise<Object>} Persisted media metadata row
     */
    async uploadMedia(currentUser, file, provider = 'supabase', googleAccessToken = null) {
        if (provider === 'google_drive' && !MediaStorageService.isGoogleDriveConfigured()) {
            const err = new Error('Google Drive is not configured on this server.');
            err.statusCode = 503;
            throw err;
        }

        const storagePath = buildStoragePath(file.mimetype, file.originalname);
        let providerFileId = null;

        // 1. Upload binary to storage provider
        if (provider === 'supabase') {
            await MediaStorageService.uploadToSupabase(file.buffer, storagePath, file.mimetype);
        } else {
            const result = await MediaStorageService.uploadToGoogleDrive(
                file.buffer, file.originalname, file.mimetype, googleAccessToken,
            );
            providerFileId = result.fileId;
        }

        // 2. Persist metadata — clean up storage if this fails
        let record;
        try {
            record = await MediaRepository.create({
                original_name:    file.originalname,
                storage_path:     storagePath,
                mime_type:        file.mimetype,
                file_size:        file.size,
                provider:         provider,
                provider_file_id: providerFileId,
                uploaded_by:      currentUser.user_id,
            });
        } catch (dbError) {
            // Compensating transaction: remove the already-uploaded object
            try {
                if (provider === 'supabase') {
                    await MediaStorageService.deleteFromSupabase(storagePath);
                } else if (providerFileId) {
                    await MediaStorageService.deleteFromGoogleDrive(providerFileId, googleAccessToken);
                }
            } catch (_cleanupError) {
                // Log cleanup failure but surface the original DB error
                console.error('[MediaService] Storage cleanup failed after DB error:', _cleanupError.message);
            }
            throw dbError;
        }

        return record;
    },

    /**
     * List media with pagination and filters.
     * RBAC: admins see all; staff see only their own uploads.
     * Staff can further filter by their own criteria; they cannot supply
     * an arbitrary `uploaded_by` to view other users' media.
     *
     * @param {Object} currentUser
     * @param {Object} queryParams  - page, limit, search, mimeType, provider, uploadedBy, dateFrom, dateTo
     * @returns {Promise<{ data, total, page, limit }>}
     */
    async listMedia(currentUser, queryParams) {
        const {
            page      = 1,
            limit     = 20,
            search,
            mime_type,
            provider,
            uploaded_by,
            date_from,
            date_to,
        } = queryParams;

        const adminUser = await isAdmin(currentUser);

        // Non-admins are always scoped to their own uploads
        const uploadedByFilter = adminUser
            ? (uploaded_by || undefined)
            : currentUser.user_id;

        const { data, total } = await MediaRepository.findAll({
            page,
            limit,
            search,
            mimeType:   mime_type,
            provider,
            uploadedBy: uploadedByFilter,
            dateFrom:   date_from,
            dateTo:     date_to,
        });

        return {
            data,
            total,
            page:  parseInt(page)  || 1,
            limit: parseInt(limit) || 20,
        };
    },

    /**
     * Get a single media record by ID.
     * Any authenticated user may view media metadata (needed for conversation attachments).
     * IDOR protection: if the record does not exist, return 404 — do not distinguish
     * "not found" from "forbidden" for non-admin users on this read-only endpoint.
     *
     * @param {string} mediaId
     * @returns {Promise<Object>}
     */
    async getMedia(mediaId) {
        const media = await MediaRepository.findById(mediaId);
        if (!media) {
            const err = new Error('Media not found.');
            err.statusCode = 404;
            throw err;
        }
        return media;
    },

    /**
     * Generate a temporary signed URL for authorized file access.
     * Any authenticated user can request a signed URL (media is a shared resource).
     * IDOR protection is provided by the fact that the media_id must be valid.
     *
     * @param {string} mediaId
     * @param {string} [googleAccessToken] - Required for Google Drive media
     * @returns {Promise<{ url: string, expires_in: number }>}
     */
    async getSignedUrl(mediaId, googleAccessToken = null) {
        const media = await MediaRepository.findById(mediaId);
        if (!media) {
            const err = new Error('Media not found.');
            err.statusCode = 404;
            throw err;
        }

        const expiresIn = config.media.signedUrlExpirySeconds;

        let url;
        if (media.provider === 'supabase') {
            url = await MediaStorageService.getSupabaseSignedUrl(media.storage_path, expiresIn);
        } else {
            // Google Drive
            if (!googleAccessToken) {
                const err = new Error('A Google access token is required to generate a signed URL for Google Drive media.');
                err.statusCode = 400;
                throw err;
            }
            url = await MediaStorageService.getGoogleDriveDownloadUrl(media.provider_file_id, googleAccessToken);
        }

        return { url, expires_in: expiresIn };
    },

    /**
     * Delete media from both storage and the database.
     * Authorization: only the uploader or an admin may delete.
     *
     * Failure handling:
     *   - DB record is deleted first, then storage object.
     *   - If storage deletion fails after DB deletion, the error is logged
     *     but a success is still returned (DB is the source of truth).
     *     The storage object becomes orphaned — this should be surfaced in
     *     logs for manual cleanup.
     *
     * @param {Object} currentUser
     * @param {string} mediaId
     * @param {string} [googleAccessToken] - Required for Google Drive media
     * @returns {Promise<Object>} Deleted record
     */
    async deleteMedia(currentUser, mediaId, googleAccessToken = null) {
        const media = await MediaRepository.findById(mediaId);
        if (!media) {
            const err = new Error('Media not found.');
            err.statusCode = 404;
            throw err;
        }

        // Authorization check
        const adminUser = await isAdmin(currentUser);
        if (!adminUser && media.uploaded_by !== currentUser.user_id) {
            const err = new Error('You do not have permission to delete this media.');
            err.statusCode = 403;
            throw err;
        }

        // 1. Remove DB record (source of truth)
        const deleted = await MediaRepository.deleteById(mediaId);

        // 2. Remove from storage (best-effort)
        try {
            if (media.provider === 'supabase') {
                await MediaStorageService.deleteFromSupabase(media.storage_path);
            } else if (media.provider === 'google_drive' && media.provider_file_id) {
                if (!googleAccessToken) {
                    console.warn('[MediaService] Google access token not provided for Drive deletion. Storage object may be orphaned.');
                } else {
                    await MediaStorageService.deleteFromGoogleDrive(media.provider_file_id, googleAccessToken);
                }
            }
        } catch (storageError) {
            console.error('[MediaService] Storage deletion failed after DB record removed:', storageError.message);
            // Surface this in logs but do not fail the API response — DB record is gone.
        }

        return deleted;
    },

    // ── Google Drive OAuth ────────────────────────────────────────────────────

    /**
     * Returns the Google OAuth2 authorization URL.
     * Throws 503 if Google Drive is not configured.
     * @returns {Promise<string>}
     */
    async getGoogleAuthUrl() {
        return MediaStorageService.getGoogleAuthUrl();
    },

    /**
     * Exchanges an OAuth2 code for tokens.
     * Tokens should be stored securely by the frontend — the backend does NOT
     * persist refresh tokens to avoid storing sensitive credentials in the DB.
     *
     * @param {string} code
     * @returns {Promise<Object>} Token object (access_token, refresh_token, expiry_date)
     */
    async handleGoogleCallback(code) {
        if (!code) {
            const err = new Error('Authorization code is required.');
            err.statusCode = 400;
            throw err;
        }
        return MediaStorageService.exchangeGoogleCode(code);
    },
};
