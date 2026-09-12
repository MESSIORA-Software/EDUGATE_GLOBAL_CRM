import { supabase } from '../database/supabaseClient.js';

export const OppertunityNoteRepository = {
    

    async createOppertunityNote(oppertunityNoteData) {
        const { data, error } = await supabase
            .from('OPPORTUNITY_NOTE')
            .insert([oppertunityNoteData])
            .select()
            .single();

        if (error) {
            throw new Error(`Error creating opportunity note: ${error.message}`);
        }

        return data;
    },

    async updateOppertunityNote(note_id, updatedData) {
        const { data, error } = await supabase
            .from('OPPORTUNITY_NOTE')
            .update(updatedData)
            .eq('note_id', note_id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error updating opportunity note: ${error.message}`);
        }

        return data;
    },

    async getOppertunityNoteById(note_id) {
        const { data, error } = await supabase
            .from('OPPORTUNITY_NOTE')
            .select('*')
            .eq('note_id', note_id)
            .single();

        if (error) {
            throw new Error(`Error fetching opportunity note: ${error.message}`);
        }

        return data;    
    },

    async deleteOppertunityNote(note_id) {
        const { data, error } = await supabase
            .from('OPPORTUNITY_NOTE')
            .delete()
            .eq('note_id', note_id)
            .select()
            .single();  

            if (error) {
                throw new Error(`Error deleting opportunity note: ${error.message}`);
            }
            return data;
        }


}