import { ConversationService } from '../services/ConversationService.js';
import { FacebookMessengerService } from '../services/FacebookMessengerService.js';

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
};
