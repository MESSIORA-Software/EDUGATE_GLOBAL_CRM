import { supabase } from '../database/supabaseClient.js';

export const ConversationRepository = {
    // 1. Get all conversations (for Admin) with channel, client_id, and status filtering
    async getAllConversations(filters = {}) {
        let query = supabase
            .from('conversations')
            .select(`
                *,
                clients:client_id (client_id, name, email, dob, source),
                assigned_staff:assigned_staff_id (user_id, name, email),
                messages:messages(message_id, sender_type, created_at, content)
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
        // Step 1: Find all client_ids assigned to this staff member in opportunities
        const { data: opps } = await supabase
            .from('opportunities')
            .select('client_id')
            .eq('assigned_staff_id', staffId);

        const assignedClientIds = (opps || []).map(o => o.client_id).filter(Boolean);

        let query = supabase
            .from('conversations')
            .select(`
                *,
                clients:client_id (client_id, name, email, dob, source),
                assigned_staff:assigned_staff_id (user_id, name, email),
                messages:messages(message_id, sender_type, created_at, content)
            `)
            .order('last_message_at', { ascending: false });

        if (assignedClientIds.length > 0) {
            query = query.or(`assigned_staff_id.eq.${staffId},client_id.in.(${assignedClientIds.join(',')})`);
        } else {
            query = query.eq('assigned_staff_id', staffId);
        }

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

    // 7. Assign or reassign staff member.
    // Module 11: executed through the assign_conversation_staff() database function so
    // that validation, the authenticated actor and the update happen in ONE transaction
    // (the notification trigger records the actor from that transaction).
    async assignStaff(conversationId, staffId, actorUserId) {
        const { data, error } = await supabase.rpc('assign_conversation_staff', {
            p_conversation_id: conversationId,
            p_staff_id: staffId,
            p_actor_id: actorUserId
        });

        if (error) {
            const statusByCode = { 'P0002': 404, '22023': 400, '42501': 403 };
            const statusCode = statusByCode[error.code];
            if (statusCode) {
                const err = new Error(
                    statusCode === 404 ? 'Conversation not found' :
                    statusCode === 403 ? 'You are not allowed to assign staff.' :
                    'Invalid conversation or staff member.'
                );
                err.statusCode = statusCode;
                throw err;
            }
            console.error('[ConversationRepository] assign_conversation_staff failed:', error.code, error.message);
            const err = new Error('Failed to assign staff.');
            err.statusCode = 500;
            throw err;
        }
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
