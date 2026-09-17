import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { ClientRepository } from '../repositories/ClientRepository.js';
import { OppertunityRepository } from '../repositories/OppertunityRepository.js';
import { roleRepository } from '../repositories/UserRoleRepository.js';
import { supabase } from '../database/supabaseClient.js';

export const ConversationService = {
    // 1. Get conversations with RBAC & channel filtering
    async getConversations(currentUser, filters = {}) {
        let roleName = currentUser.role_name;

        if (!roleName && currentUser.role_id) {
            const role = await roleRepository.findById(currentUser.role_id);
            roleName = role?.role_name?.toLowerCase();
        } else if (roleName) {
            roleName = roleName.toLowerCase();
        }

        const isAdmin = roleName === 'admin' || roleName === 'super admin';

        if (isAdmin) {
            return await ConversationRepository.getAllConversations(filters);
        } else {
            return await ConversationRepository.getConversationsByStaff(currentUser.user_id, filters);
        }
    },

    // 2. Get single conversation detail
    async getConversationDetails(conversationId, currentUser) {
        const conversation = await ConversationRepository.getConversationById(conversationId);
        if (!conversation) {
            const error = new Error('Conversation not found');
            error.statusCode = 404;
            throw error;
        }

        const role = currentUser.role_name?.toLowerCase() === 'admin' ? 'admin' : 'staff';
        await ConversationRepository.markAsRead(conversationId, role);

        return conversation;
    },

    // 3. Get all channel conversations for a specific client (WhatsApp, Messenger, SMS, Call)
    async getClientConversations(clientId) {
        return await ConversationRepository.getConversationsByClientId(clientId);
    },

    // 4. Assign Staff member to conversation
    async assignStaff(conversationId, staffId) {
        return await ConversationRepository.assignStaff(conversationId, staffId);
    },

    // 5. Update Client Details (Email, DOB, Source)
    async updateClientDetails(clientId, updateData) {
        return await ClientRepository.updateClient(clientId, updateData);
    },

    // 6. Inbound Communication Handler (Auto-Lead Creation)
    async handleInboundCommunication({ channel, channelClientId, clientName, clientEmail, content, messageType = 'text', callMetadata = null, media_url = null }) {
        // Step A: Check if a conversation thread already exists
        let conversation = await ConversationRepository.findByChannelAndClientId(channel, channelClientId);
        let client = null;

        if (conversation && conversation.client_id) {
            const { data } = await supabase.from('clients').select('*').eq('client_id', conversation.client_id).maybeSingle();
            client = data;
        }

        // Step B: If client not linked, find by email or create new client without touching phone
        if (!client) {
            if (clientEmail) {
                const { data } = await supabase.from('clients').select('*').eq('email', clientEmail).maybeSingle();
                client = data;
            }

            if (!client) {
                client = await ClientRepository.createClient({
                    name: clientName || `Lead (${channelClientId})`,
                    email: clientEmail || null,
                    source: channel.toUpperCase()
                });
            }
        }

        // Step C: Auto create Opportunity as "New Lead" if no open opportunity exists
        const { data: existingOpp } = await supabase
            .from('opportunities')
            .select('*')
            .eq('client_id', client.client_id)
            .eq('is_archived', false)
            .maybeSingle();

        if (!existingOpp) {
            const { data: statusData } = await supabase
                .from('opportunity_statuses')
                .select('status_id')
                .ilike('status_name', '%New Lead%')
                .maybeSingle();

            await OppertunityRepository.createOppertunity({
                client_id: client.client_id,
                status_id: statusData ? statusData.status_id : 1,
                is_archived: false,
                created_by: null
            });
        }

        // Step D: Create Conversation Thread if not exists
        if (!conversation) {
            conversation = await ConversationRepository.createConversation({
                client_id: client.client_id,
                channel: channel,
                channel_client_id: channelClientId,
                status: 'open'
            });
        }

        // Step E: Insert the inbound message
        const { MessageRepository } = await import('../repositories/MessageRepository.js');
        const message = await MessageRepository.createMessage({
            conversation_id: conversation.conversation_id,
            sender_type: 'client',
            message_type: messageType,
            content: content,
            media_url: media_url,
            call_metadata: callMetadata,
            delivery_status: 'delivered'
        });

        return { conversation, message, client };
    }
};
