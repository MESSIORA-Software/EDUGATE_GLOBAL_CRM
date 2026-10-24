import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { ClientRepository } from '../repositories/ClientRepository.js';
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

        const isAdmin = roleName === 'admin' || roleName === 'super admin' ||
            String(currentUser.role_id || '').toUpperCase() === 'SUPER_ADMIN' ||
            String(currentUser.role_id || '').toUpperCase() === 'ADMIN' ||
            String(currentUser.role_id || '').toUpperCase().endsWith('ADMIN');

        let conversations = [];
        if (isAdmin) {
            conversations = await ConversationRepository.getAllConversations(filters);
        } else {
            conversations = await ConversationRepository.getConversationsByStaff(currentUser.user_id, filters);
        }

        if (Array.isArray(conversations) && conversations.length > 0) {
            const clientIds = conversations.map(c => c.client_id).filter(Boolean);
            let oppMap = new Map();
            if (clientIds.length > 0) {
                try {
                    const { data: opps } = await supabase
                        .from('opportunities')
                        .select('opportunity_id, client_id, status_id, assigned_staff_id, is_archived')
                        .in('client_id', clientIds);
                    (opps || []).forEach(o => {
                        if (o.client_id) oppMap.set(o.client_id, o);
                    });
                } catch (e) {
                    console.warn('[ConversationService] Failed to load opportunities for conversations:', e?.message);
                }
            }

            conversations.forEach(c => {
                if (c.client_id && oppMap.has(c.client_id)) {
                    c.opportunity = oppMap.get(c.client_id);
                    c.has_opportunity = true;
                } else {
                    c.opportunity = null;
                    c.has_opportunity = false;
                }
            });
        }

        return conversations;
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

        if (conversation.client_id) {
            try {
                const { data: opp } = await supabase
                    .from('opportunities')
                    .select('opportunity_id, client_id, status_id, assigned_staff_id, is_archived')
                    .eq('client_id', conversation.client_id)
                    .maybeSingle();
                conversation.opportunity = opp || null;
                conversation.has_opportunity = !!opp;
            } catch (e) {
                conversation.opportunity = null;
                conversation.has_opportunity = false;
            }
        } else if (conversation.channel_client_id) {
            try {
                const { data: client } = await supabase
                    .from('clients')
                    .select('client_id')
                    .eq('email', conversation.channel_client_id.trim())
                    .maybeSingle();
                if (client?.client_id) {
                    const { data: opp } = await supabase
                        .from('opportunities')
                        .select('opportunity_id, client_id, status_id, assigned_staff_id, is_archived')
                        .eq('client_id', client.client_id)
                        .maybeSingle();
                    conversation.opportunity = opp || null;
                    conversation.has_opportunity = !!opp;
                } else {
                    conversation.opportunity = null;
                    conversation.has_opportunity = false;
                }
            } catch (e) {
                conversation.opportunity = null;
                conversation.has_opportunity = false;
            }
        }

        return conversation;
    },

    // 3. Get all channel conversations for a specific client (WhatsApp, Messenger, SMS, Call)
    async getClientConversations(clientId) {
        return await ConversationRepository.getConversationsByClientId(clientId);
    },

    // 3b. Get or create conversation for a client and specific channel
    async getOrCreateClientConversation(clientId, channel = 'messenger') {
        const normalizedChannel = (channel || 'messenger').toLowerCase();

        // Check if conversation already exists for this client and channel
        const { data: existing } = await supabase
            .from('conversations')
            .select(`
                *,
                clients:client_id (client_id, name, email, dob, source),
                assigned_staff:assigned_staff_id (user_id, name, email),
                messages:messages(message_id, sender_type, created_at, content)
            `)
            .eq('client_id', clientId)
            .eq('channel', normalizedChannel)
            .order('last_message_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existing) {
            return existing;
        }

        // Fetch client details
        const { data: client, error: clientErr } = await supabase
            .from('clients')
            .select('*')
            .eq('client_id', clientId)
            .single();

        if (clientErr || !client) {
            const err = new Error('Client not found');
            err.statusCode = 404;
            throw err;
        }

        const channelClientId = normalizedChannel === 'email'
            ? (client.email || `client_${clientId}@edugate.com`)
            : (client.phone || client.name || `client_${clientId}`);

        const newConv = await ConversationRepository.createConversation({
            client_id: client.client_id,
            channel: normalizedChannel,
            channel_client_id: channelClientId,
            status: 'open',
            last_message_at: new Date().toISOString()
        });

        return await ConversationRepository.getConversationById(newConv.conversation_id);
    },

    // 4. Assign Staff member to conversation (actor = authenticated user, from JWT)
    async assignStaff(conversationId, staffId, currentUser) {
        return await ConversationRepository.assignStaff(conversationId, staffId, currentUser.user_id);
    },

    // 5. Update Client Details (Email, DOB, Source)
    async updateClientDetails(clientId, updateData) {
        return await ClientRepository.updateClient(clientId, updateData);
    },

    // 6. Inbound Communication Handler (Does NOT auto-create opportunity)
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
                const { data } = await supabase.from('clients').select('*').ilike('email', clientEmail).maybeSingle();
                client = data;
            }

            if (!client) {
                // If channel is email, do not auto-create random clients for automated/unknown senders
                if (channel === 'email') {
                    console.log(`[ConversationService] Inbound email from ${channelClientId} rejected (not a registered student).`);
                    return null;
                }

                client = await ClientRepository.createClient({
                    name: clientName || `Lead (${channelClientId})`,
                    email: clientEmail || null,
                    source: channel.toUpperCase()
                });
            }
        }

        // Step C: Create Conversation Thread if not exists
        if (!conversation) {
            conversation = await ConversationRepository.createConversation({
                client_id: client.client_id,
                channel: channel,
                channel_client_id: channelClientId,
                status: 'open'
            });
        }

        // Step D: Insert the inbound message
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
    },

    // 7. Register/Update Student and Create Opportunity from Conversation
    async createOpportunityFromConversation(conversationId, currentUser, { name, email, dob, source, status_id, assigned_staff_id, note }) {
        if (!name || !name.trim()) {
            const err = new Error('Client / Student name is required.');
            err.statusCode = 400;
            throw err;
        }
        if (!status_id) {
            const err = new Error('Opportunity status is required.');
            err.statusCode = 400;
            throw err;
        }

        const conversation = await ConversationRepository.getConversationById(conversationId);
        if (!conversation) {
            const err = new Error('Conversation not found');
            err.statusCode = 404;
            throw err;
        }

        const actorId = currentUser?.user_id || null;

        // 1. Register or update Client (Student)
        let client = null;
        if (conversation.client_id) {
            client = await ClientRepository.updateClient(conversation.client_id, {
                name: name.trim(),
                email: email?.trim() || null,
                dob: dob || null,
                source: source?.trim() || conversation.channel.toUpperCase()
            });
        } else {
            let existingClient = null;
            if (email && email.trim()) {
                const { data } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('email', email.trim())
                    .maybeSingle();
                existingClient = data;
            }

            if (existingClient) {
                client = await ClientRepository.updateClient(existingClient.client_id, {
                    name: name.trim(),
                    dob: dob || existingClient.dob,
                    source: source?.trim() || existingClient.source || conversation.channel.toUpperCase()
                });
            } else {
                client = await ClientRepository.createClient({
                    name: name.trim(),
                    email: email?.trim() || null,
                    dob: dob || null,
                    source: source?.trim() || conversation.channel.toUpperCase(),
                    created_by: actorId,
                    created_at: new Date()
                });
            }
            await supabase
                .from('conversations')
                .update({ client_id: client.client_id })
                .eq('conversation_id', conversationId);
        }

        // 2. Check existing opportunity or create new for pipeline
        const { data: existingOpp } = await supabase
            .from('opportunities')
            .select('*')
            .eq('client_id', client.client_id)
            .maybeSingle();

        let opportunity = null;
        if (existingOpp) {
            const { data: updatedOpp, error: updateErr } = await supabase
                .from('opportunities')
                .update({
                    status_id: Number(status_id),
                    assigned_staff_id: assigned_staff_id ? Number(assigned_staff_id) : null,
                    is_archived: false,
                    updated_by: actorId
                })
                .eq('opportunity_id', existingOpp.opportunity_id)
                .select()
                .single();
            if (updateErr) throw updateErr;
            opportunity = updatedOpp || existingOpp;
        } else {
            const { data: newOpp, error: createErr } = await supabase
                .from('opportunities')
                .insert([{
                    client_id: client.client_id,
                    status_id: Number(status_id),
                    assigned_staff_id: assigned_staff_id ? Number(assigned_staff_id) : null,
                    is_archived: false,
                    created_by: actorId,
                    updated_by: actorId
                }])
                .select()
                .single();
            if (createErr) throw createErr;
            opportunity = newOpp;
        }

        // 3. Add initial opportunity note if provided
        if (note && note.trim() && opportunity?.opportunity_id) {
            try {
                const { data: newNote } = await supabase
                    .from('OPPORTUNITY_NOTE')
                    .insert([{
                        opportunity_id: opportunity.opportunity_id,
                        note: note.trim(),
                        created_by: actorId
                    }])
                    .select()
                    .single();

                if (newNote?.note_id) {
                    await supabase
                        .from('opportunities')
                        .update({ note_id: newNote.note_id })
                        .eq('opportunity_id', opportunity.opportunity_id);
                }
            } catch (noteErr) {
                console.warn('[ConversationService] Could not insert initial opportunity note:', noteErr?.message);
            }
        }

        // 4. If assigned_staff_id provided, sync conversation assigned staff
        if (assigned_staff_id) {
            try {
                await ConversationRepository.assignStaff(conversationId, Number(assigned_staff_id), actorId);
            } catch (e) {
                await supabase
                    .from('conversations')
                    .update({ assigned_staff_id: Number(assigned_staff_id) })
                    .eq('conversation_id', conversationId);
            }
        }

        return { client, opportunity };
    }
};
