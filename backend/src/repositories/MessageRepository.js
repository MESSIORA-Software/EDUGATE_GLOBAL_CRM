import { supabase } from '../database/supabaseClient.js';

export const MessageRepository = {
    // 1. Create a new message (text, media, or call log)
    async createMessage(messageData) {
        const { data, error } = await supabase
            .from('messages')
            .insert([messageData])
            .select(`
                *,
                sender:sender_id (user_id, name, email)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    // 2. Fetch message history for a conversation
    async getMessagesByConversationId(conversationId, limit = 50, offset = 0) {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id (user_id, name, email)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
    },

    // 3. Update delivery status ('sent', 'delivered', 'read')
    async updateMessageStatus(messageId, status) {
        const { data, error } = await supabase
            .from('messages')
            .update({ delivery_status: status })
            .eq('message_id', messageId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
