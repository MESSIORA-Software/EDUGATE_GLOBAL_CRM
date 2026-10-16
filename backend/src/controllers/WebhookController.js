import crypto from 'crypto';
import { ConversationService } from '../services/ConversationService.js';
import { FacebookMessengerService } from '../services/FacebookMessengerService.js';
import { config } from '../config/index.js';

/** HMAC-SHA256 of the RAW body with the app secret, compared in constant time. */
export function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
    if (!rawBody || typeof signatureHeader !== 'string' || !signatureHeader.startsWith('sha256=')) return false;
    const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    const received = signatureHeader.slice('sha256='.length);
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(received, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const WebhookController = {
    // 1. Verify Webhook (GET request from Meta / Facebook)
    verifyFacebookWebhook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('✅ Facebook Webhook Verified successfully!');
                return res.status(200).send(challenge);
            } else {
                return res.sendStatus(403);
            }
        }
        return res.sendStatus(400);
    },

    // 2. Receive Messages from Facebook (POST request from Meta)
    async handleFacebookWebhook(req, res) {
        // Verify the Meta signature BEFORE trusting the payload (fail closed).
        const appSecret = config.facebook.appSecret;
        if (!appSecret) {
            console.error('FACEBOOK_APP_SECRET is not configured; rejecting webhook.');
            return res.sendStatus(503);
        }
        if (!verifyMetaSignature(req.rawBody, req.headers['x-hub-signature-256'], appSecret)) {
            return res.sendStatus(401);
        }

        const body = req.body;

        try {
        if (body.object === 'page' && Array.isArray(body.entry)) {
            for (const entry of body.entry) {
              for (const webhookEvent of entry.messaging || []) {
                if (!webhookEvent) continue;

                const senderPsid = webhookEvent.sender?.id;
                const recipientPageId = webhookEvent.recipient?.id;

                // Ignore echo messages (messages sent by the page itself)
                if (webhookEvent.message && !webhookEvent.message.is_echo) {
                    const messageText = webhookEvent.message.text || '';
                    const attachments = webhookEvent.message.attachments || [];

                    let mediaUrl = null;
                    let messageType = 'text';

                    if (attachments.length > 0) {
                        messageType = attachments[0].type || 'image';
                        mediaUrl = attachments[0].payload?.url || null;
                    }

                    // Fetch user's Facebook name
                    const profile = await FacebookMessengerService.getUserProfile(senderPsid);
                    const clientName = profile ? profile.name : `FB User (${senderPsid})`;

                    // Ingest message, create Client if new, and create Opportunity as "New Lead"
                    try {
                        await ConversationService.handleInboundCommunication({
                            channel: 'messenger',
                            channelClientId: senderPsid,
                            clientName: clientName,
                            content: messageText || (mediaUrl ? `[Sent ${messageType}]` : ''),
                            messageType: messageType,
                            media_url: mediaUrl
                        });
                        console.log(`📩 Inbound Messenger message received from ${clientName}`);
                    } catch (err) {
                        console.error('Error handling Facebook inbound message:', err);
                    }
                }
              }
            }
        }
        } catch (err) {
            console.error('Error processing Facebook webhook payload:', err);
        }

        // Respond after processing: on serverless, work after the response may be frozen.
        // Signature is verified, so this only acknowledges authentic Meta traffic.
        return res.status(200).send('EVENT_RECEIVED');
    }
};
