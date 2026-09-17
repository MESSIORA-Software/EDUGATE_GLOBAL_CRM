import { supabase } from '../database/supabaseClient.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { MessageRepository } from '../repositories/MessageRepository.js';
import { ClientRepository } from '../repositories/ClientRepository.js';

export const MobileSyncService = {
    // 1. Sync Phone Call Logs from Staff Mobile Phone (No auto opportunity creation)
    async syncCallLogs(staffUser, callLogs = []) {
        const results = [];

        for (const log of callLogs) {
            const {
                phone_number,
                contact_name,
                direction, // 'inbound' or 'outbound'
                call_status, // 'completed', 'missed', 'rejected', 'busy'
                duration_seconds = 0,
                timestamp,
                recording_url = null
            } = log;

            if (!phone_number) continue;

            const normalizedPhone = phone_number.replace(/\s+/g, '');
            const callDate = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

            // Step A: Find or Create Conversation thread for this phone number
            let conversation = await ConversationRepository.findByChannelAndClientId('call', normalizedPhone);
            let client = null;

            if (conversation && conversation.client_id) {
                const { data } = await supabase.from('clients').select('*').eq('client_id', conversation.client_id).maybeSingle();
                client = data;
            }

            // Step B: If client doesn't exist, create Client
            if (!client) {
                client = await ClientRepository.createClient({
                    name: contact_name || `Caller (${normalizedPhone})`,
                    email: null,
                    source: 'PHONE_CALL'
                });
            }

            // Step C: Create Conversation if not exists
            if (!conversation) {
                conversation = await ConversationRepository.createConversation({
                    client_id: client.client_id,
                    assigned_staff_id: staffUser?.user_id || null,
                    channel: 'call',
                    channel_client_id: normalizedPhone,
                    status: 'open'
                });
            }

            // Step D: Deduplication Check (Avoid syncing same call record twice)
            const { data: existingMsg } = await supabase
                .from('messages')
                .select('message_id')
                .eq('conversation_id', conversation.conversation_id)
                .eq('created_at', callDate)
                .maybeSingle();

            if (!existingMsg) {
                const callContent = `${direction === 'inbound' ? 'Inbound' : 'Outbound'} Call (${call_status}, ${duration_seconds}s)`;

                const newMsg = await MessageRepository.createMessage({
                    conversation_id: conversation.conversation_id,
                    sender_type: direction === 'inbound' ? 'client' : 'staff',
                    sender_id: direction === 'outbound' ? (staffUser?.user_id || null) : null,
                    message_type: 'call_log',
                    content: callContent,
                    call_metadata: {
                        duration_seconds,
                        call_status,
                        direction,
                        recording_url
                    },
                    delivery_status: 'delivered',
                    created_at: callDate
                });
                results.push(newMsg);
            }
        }

        return { synced_count: results.length, data: results };
    },

    // 2. Sync SMS Messages from Staff Mobile Phone (No auto opportunity creation)
    async syncSmsMessages(staffUser, smsList = []) {
        const results = [];

        for (const sms of smsList) {
            const {
                phone_number,
                contact_name,
                body,
                direction, // 'inbound' or 'outbound'
                timestamp
            } = sms;

            if (!phone_number || !body) continue;

            const normalizedPhone = phone_number.replace(/\s+/g, '');
            const smsDate = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

            // Step A: Find or Create Conversation thread for SMS
            let conversation = await ConversationRepository.findByChannelAndClientId('sms', normalizedPhone);
            let client = null;

            if (conversation && conversation.client_id) {
                const { data } = await supabase.from('clients').select('*').eq('client_id', conversation.client_id).maybeSingle();
                client = data;
            }

            // Step B: Create Client if new
            if (!client) {
                client = await ClientRepository.createClient({
                    name: contact_name || `SMS Contact (${normalizedPhone})`,
                    email: null,
                    source: 'SMS'
                });
            }

            // Step C: Create Conversation if not exists
            if (!conversation) {
                conversation = await ConversationRepository.createConversation({
                    client_id: client.client_id,
                    assigned_staff_id: staffUser?.user_id || null,
                    channel: 'sms',
                    channel_client_id: normalizedPhone,
                    status: 'open'
                });
            }

            // Step D: Deduplication Check
            const { data: existingMsg } = await supabase
                .from('messages')
                .select('message_id')
                .eq('conversation_id', conversation.conversation_id)
                .eq('created_at', smsDate)
                .maybeSingle();

            if (!existingMsg) {
                const newMsg = await MessageRepository.createMessage({
                    conversation_id: conversation.conversation_id,
                    sender_type: direction === 'inbound' ? 'client' : 'staff',
                    sender_id: direction === 'outbound' ? (staffUser?.user_id || null) : null,
                    message_type: 'text',
                    content: body,
                    delivery_status: 'delivered',
                    created_at: smsDate
                });
                results.push(newMsg);
            }
        }

        return { synced_count: results.length, data: results };
    }
};
