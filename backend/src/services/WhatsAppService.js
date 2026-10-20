import dotenv from 'dotenv';
import { config } from '../config/index.js';
import { WhatsAppBaileysService } from './WhatsAppBaileysService.js';

dotenv.config();

/**
 * Unified WhatsApp Service
 * Primary: Linked Device (QR-code based via Baileys - no Meta verification needed)
 * Fallback: Meta Cloud API (if configured)
 */
export const WhatsAppService = {
    /**
     * Clean and format phone number (digits only)
     * e.g., '+94 77 123 4567' -> '94771234567'
     */
    normalizePhoneNumber(phone) {
        if (!phone) return '';
        let cleaned = phone.toString().replace(/\D/g, '');
        if (cleaned.startsWith('00')) {
            cleaned = cleaned.substring(2);
        }
        return cleaned;
    },

    /**
     * Send outbound text or media message to a WhatsApp user
     * @param {string} recipientPhone - Customer's WhatsApp phone number
     * @param {object} messagePayload - { content, media_url, message_type }
     */
    async sendMessage(recipientPhone, messagePayload) {
        const to = this.normalizePhoneNumber(recipientPhone);
        if (!to) {
            throw new Error('A valid recipient phone number is required for WhatsApp.');
        }

        if (!messagePayload?.content && !messagePayload?.media_url) {
            throw new Error('A message must contain text or media.');
        }

        // 1. If Linked Device (QR Code) is connected, send through it
        if (WhatsAppBaileysService.connectionStatus === 'connected') {
            return await WhatsAppBaileysService.sendMessage(to, messagePayload);
        }

        // 2. Fallback: Meta WhatsApp Cloud API if configured
        const phoneNumberId = config.whatsapp?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = config.whatsapp?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
        const apiVersion = config.whatsapp?.apiVersion || 'v21.0';

        if (phoneNumberId && accessToken) {
            let bodyPayload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
            };

            if (messagePayload.media_url) {
                let mediaType = messagePayload.message_type || 'image';
                if (mediaType === 'audio') mediaType = 'audio';
                else if (mediaType === 'video') mediaType = 'video';
                else if (mediaType === 'document' || mediaType === 'file') mediaType = 'document';
                else mediaType = 'image';

                bodyPayload.type = mediaType;
                bodyPayload[mediaType] = {
                    link: messagePayload.media_url,
                    ...(messagePayload.content ? { caption: messagePayload.content } : {})
                };
            } else {
                bodyPayload.type = 'text';
                bodyPayload.text = {
                    preview_url: false,
                    body: messagePayload.content || ''
                };
            }

            const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyPayload)
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                console.error('[WhatsAppService] Meta API Error:', data.error);
                const errorMessage = data.error?.message || 'Failed to send WhatsApp message';
                throw new Error(`WhatsApp API Error: ${errorMessage}`);
            }

            return data;
        }

        throw new Error('WhatsApp is not connected. Please scan the QR code in the CRM WhatsApp tab to connect your phone.');
    }
};
