import { supabase } from '../database/supabaseClient.js';

export const ClientRepository = {

async createClient(clientData) {    
    const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

if (error) throw error;
    return data;        

},

async getAllClients(currentUser = null) {
    let query = supabase
        .from('clients')
        .select('*, referrers ( referrer_id, referrer_code, name, email, phone_number, whatsapp_number )');

    const isAdmin = currentUser && (
        String(currentUser.role_id || '').toUpperCase() === 'SUPER_ADMIN' ||
        String(currentUser.role_id || '').toUpperCase() === 'ADMIN' ||
        String(currentUser.role_id || '').toUpperCase().endsWith('ADMIN') ||
        String(currentUser.role_name || '').toLowerCase() === 'admin' ||
        String(currentUser.role_name || '').toLowerCase() === 'super admin'
    );

    if (currentUser && !isAdmin) {
        // Find all client_ids assigned to this staff member from opportunities and conversations
        const { data: opps } = await supabase
            .from('opportunities')
            .select('client_id')
            .eq('assigned_staff_id', currentUser.user_id);

        const { data: convs } = await supabase
            .from('conversations')
            .select('client_id')
            .eq('assigned_staff_id', currentUser.user_id);

        const assignedClientIds = Array.from(new Set([
            ...(opps || []).map(o => o.client_id),
            ...(convs || []).map(c => c.client_id)
        ])).filter(Boolean);

        if (assignedClientIds.length === 0) {
            return [];
        }
        query = query.in('client_id', assignedClientIds);
    }

    const { data, error } = await query.order('client_id', { ascending: false });
    if (error) throw error;
    return data;
},

async getClientById(client_id) {
    const { data, error } = await supabase
        .from('clients')
        .select('*, referrers ( referrer_id, referrer_code, name, email, phone_number, whatsapp_number )')
        .eq('client_id', client_id)
        .single();
    if (error) throw error;
    return data;
},

async updateClient(client_id, updatedData) {
    const { data, error } = await supabase
        .from('clients')
        .update(updatedData)
        .eq('client_id', client_id)
        .select()
        .single();
    if (error) throw error;
    return data;
}, 
 
async deleteClient(client_id) {
    // 1. Remove associated opportunity pipeline records so card is completely removed
    const { error: oppError } = await supabase
        .from('opportunities')
        .delete()
        .eq('client_id', client_id);
    if (oppError) {
        console.warn('Notice: Could not delete associated opportunities:', oppError.message);
    }

    // 2. Remove associated conversations if any
    await supabase
        .from('conversations')
        .delete()
        .eq('client_id', client_id);

    // 3. Delete the client record
    const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('client_id', client_id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

}
