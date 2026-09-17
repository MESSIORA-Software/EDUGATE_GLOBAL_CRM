import { supabase } from '../database/supabaseClient.js';

export const ConversationRepository = {
    // 1. Get all conversations (for Admin) with channel, client_id, and status filtering
    async getAllConversations(filters = {}) {
        let query = supabase
            .from('conversations')
            .select(`
                *,
                clients:client_id (client_id, name, email, dob, source),
                assigned_staff:assigned_staff_id (user_id, name, email)
            `)
            .order('last_message_at', { ascending: false });

        if (filters.channel) {
            query = query.eq('channel', filters.channel.toLowerCase());
        }
        if (filters.client_id) {
            query = query.eq('client_id', filters.client_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // 2. Get conversations assigned to a specific staff member (for Staff)
    async getConversationsByStaff(staffId, filters = {}) {
        let query = supabase
            .from('conversations')
            .select(`
                *,
                clients:client_id (client_id, name, email, dob, source),
                assigned_staff:assigned_staff_id (user_id, name, email)
            `)
            .eq('assigned_staff_id', staffId)
            .order('last_message_at', { ascending: false });

        if (filters.channel) {
            query = query.eq('channel', filters.channel.toLowerCase());
        }
        if (filters.client_id) {
            query = query.eq('client_id', filters.client_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // 3. Get single conversation by ID with client details
    async getConversationById(conversationId) {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                clients:client_id (client_id, name, email, dob, source),
                assigned_staff:assigned_staff_id (user_id, name, email)
            `)
            .eq('conversation_id', conversationId)
            .single();

        if (error) throw error;
        return data;
    },

    // 4. Get all 4 channel conversations for a specific client
    async getConversationsByClientId(clientId) {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                assigned_staff:assigned_staff_id (user_id, name, email)
            `)
            .eq('client_id', clientId)
            .order('last_message_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // 5. Find existing conversation by channel & client handle
    async findByChannelAndClientId(channel, channelClientId) {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('channel', channel)
            .eq('channel_client_id', channelClientId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // 6. Create new conversation
    async createConversation(conversationData) {
        const { data, error } = await supabase
            .from('conversations')
            .insert([conversationData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 7. Assign or reassign staff member
    async assignStaff(conversationId, staffId) {
        const { data, error } = await supabase
            .from('conversations')
            .update({ assigned_staff_id: staffId, updated_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 8. Reset unread counts
    async markAsRead(conversationId, role = 'admin') {
        const fieldToReset = role === 'admin' ? { unread_count_admin: 0 } : { unread_count_staff: 0 };
        const { data, error } = await supabase
            .from('conversations')
            .update(fieldToReset)
            .eq('conversation_id', conversationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
