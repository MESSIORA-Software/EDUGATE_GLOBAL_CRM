import { supabase } from '../database/supabaseClient.js';

export const OppertunityStatusRepository = {

    async createOppertunityStatus(statusData) {
        const { data, error } = await supabase
            .from('opportunity_statuses')
            .insert([statusData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getAllOppertunityStatuses() {
        const { data, error } = await supabase
            .from('opportunity_statuses')
            .select('*');

        if (error) throw error;
        return data;
    },

    async updateOppertunityStatus(status_id, updatedData) {
        const { data, error } = await supabase
            .from('opportunity_statuses')
            .update(updatedData)
            .eq('status_id', status_id)
            .select()
            .single();

        if (error) throw error;
        return data;

    },

    async deleteOppertunityStatus(status_id) {
        const { data, error } = await supabase
            .from('opportunity_statuses')
            .delete()
            .eq('status_id', status_id)
            .select()
            .single();

        if (error) throw error;
        return data;

    }


}