import { supabase } from '../database/supabaseClient.js';

export const BranchRepository = {
 
    async createbranch(branchData) {
        const { data, error } = await supabase
            .from('branches')
            .insert([branchData])
            .select()
            .single();

              if (error) throw error;
        return data;
    },

    async getAllBranches() {
        const { data, error } = await supabase
            .from('branches')
            .select('*');

        if (error) throw error;
        return data;
    },

    async getBranchById(branch_id) {
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .eq('branch_id', branch_id)
            .single();

        if (error) throw error;
        return data;
    },

    async updateBranch(branch_id, branchData) {
        const { data, error } = await supabase
            .from('branches')
            .update(branchData)
            .eq('branch_id', branch_id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteBranch(branch_id) {
        const { data, error } = await supabase
            .from('branches')
            .delete()
            .eq('branch_id', branch_id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

}
