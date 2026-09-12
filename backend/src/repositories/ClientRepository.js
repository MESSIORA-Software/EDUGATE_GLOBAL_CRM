import { supabase } from '../database/supabaseClient.js';

export const ClientRepository = {
    // 1. Fetch all clients
    async findAll() {
        const { data, error } = await supabase
            .from('clients')
            .select('*');

        if (error) {
            console.error('Supabase Client findAll error:', error);
            throw error;
        }
        return data || [];
    },

    // 2. Find client by ID
    async findById(clientId) {
        const parsedId = Number(clientId) || clientId;

        const resId = await supabase
            .from('clients')
            .select('*')
            .eq('id', parsedId);

        if (!resId.error && resId.data && resId.data.length > 0) {
            return resId.data[0];
        }

        const resClientId = await supabase
            .from('clients')
            .select('*')
            .eq('client_id', parsedId);

        if (!resClientId.error && resClientId.data && resClientId.data.length > 0) {
            return resClientId.data[0];
        }

        if (resId.error && resClientId.error) {
            throw resId.error;
        }

        return null;
    },

    // 3. Create new client
    async create(clientData) {
        const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select();

        if (error) {
            console.error('Supabase Client create error:', error);
            throw error;
        }
        return data && data.length > 0 ? data[0] : clientData;
    },

    // 4. Update client
    async update(clientId, updateData) {
        const parsedId = Number(clientId) || clientId;

        const resId = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', parsedId)
            .select();

        if (!resId.error && resId.data && resId.data.length > 0) {
            return resId.data[0];
        }

        const resClientId = await supabase
            .from('clients')
            .update(updateData)
            .eq('client_id', parsedId)
            .select();

        if (!resClientId.error && resClientId.data && resClientId.data.length > 0) {
            return resClientId.data[0];
        }

        return { client_id: parsedId, ...updateData };
    },

    // 5. Delete client
    async delete(clientId) {
        const parsedId = Number(clientId) || clientId;

        const resId = await supabase
            .from('clients')
            .delete()
            .eq('id', parsedId);

        if (!resId.error) return true;

        const resClientId = await supabase
            .from('clients')
            .delete()
            .eq('client_id', parsedId);

        if (!resClientId.error) return true;

        if (resId.error) throw resId.error;
        return true;
    }
};
