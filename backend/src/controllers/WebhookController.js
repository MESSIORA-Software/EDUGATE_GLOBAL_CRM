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
    verifyFacebookWebhook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token && token === process.env.FACEBOOK_VERIFY_TOKEN) {
            console.log('Facebook Webhook Verified successfully');
            return res.status(200).send(challenge);
        }

        return res.sendStatus(mode && token ? 403 : 400);
    },

    async handleFacebookWebhook(req, res) {
        const body = req.body;
        // Acknowledge before doing network/database work, as required by Meta.
        res.status(200).send('EVENT_RECEIVED');

        if (body?.object !== 'page') return;
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

        for (const entry of body.entry || []) {
            for (const webhookEvent of entry.messaging || []) {
                const senderPsid = webhookEvent.sender?.id;
                const incomingMessage = webhookEvent.message;

                // Delivery/read events and page echoes are not customer messages.
                if (!incomingMessage || incomingMessage.is_echo || !senderPsid) continue;

                const messageText = incomingMessage.text || '';
                const attachment = incomingMessage.attachments?.[0];
                const messageType = attachment?.type || 'text';
                const mediaUrl = attachment?.payload?.url || null;

                try {
                    const profile = await FacebookMessengerService.getUserProfile(senderPsid);
                    await ConversationService.handleInboundCommunication({
                        channel: 'messenger',
                        channelClientId: senderPsid,
                        clientName: profile?.name || `Facebook User (${senderPsid})`,
                        content: messageText || (mediaUrl ? `[Sent ${messageType}]` : ''),
                        messageType,
                        media_url: mediaUrl
                    });
                } catch (error) {
                    console.error('Error handling Facebook inbound message:', error);
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
