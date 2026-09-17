import { ConversationService } from '../services/ConversationService.js';
import { FacebookMessengerService } from '../services/FacebookMessengerService.js';

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
        const body = req.body;

        // Meta requires an immediate 200 OK
        res.status(200).send('EVENT_RECEIVED');

        if (body.object === 'page') {
            for (const entry of body.entry) {
                const webhookEvent = entry.messaging?.[0];
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
};
