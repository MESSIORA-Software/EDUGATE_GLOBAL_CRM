import { supabase } from '../database/supabaseClient.js';

export const OppertunityRepository = {

    async createOppertunity(oppertunityData) {
        const { data, error } = await supabase
            .from('opportunities')
            .insert([oppertunityData]);

        if (error) {
            throw new Error(`Error creating opportunity: ${error.message}`);
        }

        return data;
    },

    async updateOppertunity(opportunity_id, updatedData) {
        const { data, error } = await supabase
            .from('opportunities')
            .update(updatedData)
            .eq('opportunity_id', opportunity_id);
        if (error) {
            throw new Error(`Error updating opportunity: ${error.message}`);
        }
        return data;
    }, 

    async getOppertunityById(opportunity_id) {
        const { data, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('opportunity_id', opportunity_id)
            .single();


        if (error) {
            throw new Error(`Error fetching opportunity: ${error.message}`);
        }

        return data;
    },
    async getOppertunitiesbyoppertunityStatus(status_id) {
        const { data, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('status_id', status_id);

        if (error) {
            throw new Error(`Error fetching opportunities: ${error.message}`);
        }

        return data;
    },

};