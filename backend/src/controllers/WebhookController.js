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
        // Verify the Meta signature BEFORE trusting the payload (fail closed in production).
        const appSecret = config.facebook?.appSecret || process.env.FACEBOOK_APP_SECRET;
        if (!appSecret) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[WebhookController] Warning: FACEBOOK_APP_SECRET is not configured in .env. Skipping signature verification in development.');
            } else {
                console.error('FACEBOOK_APP_SECRET is not configured; rejecting webhook.');
                return res.sendStatus(503);
            }
        } else if (!verifyMetaSignature(req.rawBody, req.headers['x-hub-signature-256'], appSecret)) {
            console.warn('[WebhookController] Rejecting webhook: Invalid X-Hub-Signature-256 signature.');
            return res.sendStatus(401);
        }

        const body = req.body;

        try {
            if (body?.object === 'page' && Array.isArray(body.entry)) {
                for (const entry of body.entry) {
                    for (const webhookEvent of entry.messaging || []) {
                        if (!webhookEvent) continue;

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
        } catch (error) {
            console.error('Error processing Facebook webhook payload:', error);
        }

        // Respond after processing: on serverless, work after the response may be frozen.
        // Signature is verified, so this only acknowledges authentic Meta traffic.
        return res.status(200).send('EVENT_RECEIVED');
    },

    verifyWhatsAppWebhook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        const expectedToken = config.whatsapp?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || process.env.FACEBOOK_VERIFY_TOKEN;

        if (mode === 'subscribe' && token && token === expectedToken) {
            console.log('WhatsApp Webhook Verified successfully');
            return res.status(200).send(challenge);
        }

        return res.sendStatus(mode && token ? 403 : 400);
    },

    async handleWhatsAppWebhook(req, res) {
        const appSecret = config.whatsapp?.appSecret || config.facebook?.appSecret || process.env.WHATSAPP_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

        if (!appSecret) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('[WebhookController] Warning: WhatsApp/Facebook app secret is not configured. Skipping signature verification in development.');
            } else {
                console.error('WhatsApp/Facebook app secret is not configured; rejecting webhook.');
                return res.sendStatus(503);
            }
        } else if (!verifyMetaSignature(req.rawBody, req.headers['x-hub-signature-256'], appSecret)) {
            console.warn('[WebhookController] Rejecting webhook: Invalid WhatsApp X-Hub-Signature-256 signature.');
            return res.sendStatus(401);
        }

        const body = req.body;

        try {
            if (body?.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
                for (const entry of body.entry) {
                    for (const change of entry.changes || []) {
                        if (change.field !== 'messages') continue;
                        const value = change.value;
                        if (!value || !value.messages) continue;

                        // Build contacts name map
                        const contactsMap = {};
                        for (const contact of value.contacts || []) {
                            if (contact?.wa_id) {
                                contactsMap[contact.wa_id] = contact.profile?.name;
                            }
                        }

                        for (const incomingMessage of value.messages) {
                            if (!incomingMessage || !incomingMessage.from) continue;
                            const senderPhone = incomingMessage.from; // e.g. "94771234567"
                            const clientName = contactsMap[senderPhone] || `WhatsApp User (+${senderPhone})`;
                            const msgType = incomingMessage.type || 'text';

                            let content = '';
                            let mediaUrl = null;

                            if (msgType === 'text') {
                                content = incomingMessage.text?.body || '';
                            } else if (msgType === 'image') {
                                content = incomingMessage.image?.caption || '[Sent image]';
                            } else if (msgType === 'document') {
                                content = incomingMessage.document?.caption || incomingMessage.document?.filename || '[Sent document]';
                            } else if (msgType === 'audio') {
                                content = '[Voice note / Audio]';
                            } else if (msgType === 'video') {
                                content = incomingMessage.video?.caption || '[Sent video]';
                            } else if (msgType === 'location') {
                                content = `[Location: ${incomingMessage.location?.name || ''} ${incomingMessage.location?.address || ''} (${incomingMessage.location?.latitude}, ${incomingMessage.location?.longitude})]`.trim();
                            } else if (msgType === 'button' || msgType === 'interactive') {
                                content = incomingMessage.interactive?.button_reply?.title || incomingMessage.interactive?.list_reply?.title || incomingMessage.button?.text || '[Button reply]';
                            } else {
                                content = `[${msgType} message]`;
                            }

                            try {
                                await ConversationService.handleInboundCommunication({
                                    channel: 'whatsapp',
                                    channelClientId: senderPhone,
                                    clientName: clientName,
                                    content: content,
                                    messageType: msgType,
                                    media_url: mediaUrl
                                });
                            } catch (inboundError) {
                                console.error('Error handling WhatsApp inbound message:', inboundError);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing WhatsApp webhook payload:', error);
        }

        return res.status(200).send('EVENT_RECEIVED');
    }
};
