import { MessageRepository } from '../repositories/MessageRepository.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { FacebookMessengerService } from './FacebookMessengerService.js';
import { supabase } from '../database/supabaseClient.js';

export const MessageService = {
    // 1. Get messages for a conversation
    async getMessages(conversationId, limit, offset) {
        return await MessageRepository.getMessagesByConversationId(conversationId, limit, offset);
    },

    // 2. Send outgoing message (WhatsApp & Messenger)
    async sendMessage(conversationId, staffUser, { content, media_url, media_source, message_type = 'text' }) {
        const conversation = await ConversationRepository.getConversationById(conversationId);
        if (!conversation) {
            const error = new Error('Conversation not found');
            error.statusCode = 404;
            throw error;
        }

        // Restrict sending for read-only channels
        if (conversation.channel === 'call' || conversation.channel === 'sms') {
            const error = new Error(`Cannot send outbound messages on ${conversation.channel.toUpperCase()} channel. It is read-only.`);
            error.statusCode = 400;
            throw error;
        }

        // 1. If Facebook Messenger, send via Meta Graph API
        if (conversation.channel === 'messenger') {
            await FacebookMessengerService.sendMessage(conversation.channel_client_id, {
                content,
                media_url,
                message_type
            });
        }

        // 2. Save message record in database
        const message = await MessageRepository.createMessage({
            conversation_id: conversationId,
            sender_type: 'staff',
            sender_id: staffUser.user_id,
            message_type: media_url ? (message_type || 'image') : 'text',
            content: content,
            media_url: media_url,
            media_source: media_source,
            delivery_status: 'sent'
        });

        return message;
    },

    // 3. Log Call or SMS (Read-Only History)
    async logCallOrSMS(conversationId, { sender_type = 'client', content, call_metadata, message_type = 'call_log' }) {
        return await MessageRepository.createMessage({
            conversation_id: conversationId,
            sender_type: sender_type,
            message_type: message_type,
            content: content,
            call_metadata: call_metadata,
            delivery_status: 'delivered'
        });
    },

    // 4. Upload media to Supabase Storage
    async uploadMedia(file) {
        if (!file) {
            const error = new Error('No file provided');
            error.statusCode = 400;
            throw error;
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await supabase.storage
            .from('conversation-media')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('conversation-media')
            .getPublicUrl(filePath);

        return {
            media_url: publicUrlData.publicUrl,
            file_name: file.originalname,
            mime_type: file.mimetype
        };
    }
};
