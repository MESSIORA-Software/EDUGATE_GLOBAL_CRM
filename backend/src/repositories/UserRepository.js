import { supabase } from '../database/supabaseClient.js';

export const UserRepository = {
    // Fetch users by branch ID
    async findByBranch(branchId) {
        const parsedId = Number(branchId) || branchId;

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('branch_id', parsedId);

        if (error) {
            // Fallback: try checking user_profiles table if users table does not have branch_id or fails
            const fallback = await supabase
                .from('user_profiles')
                .select('*')
                .eq('branch_id', parsedId);

            if (!fallback.error) {
                return fallback.data || [];
            }
            throw error;
        }

        return data || [];
    },

    // Fetch all users
    async findAll() {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) throw error;
        return data || [];
    }
};
