import { supabase } from '../database/supabaseClient.js';

export const BranchRepository = {
    // 1. Fetch all branches
    async findAll() {
        const { data, error } = await supabase
            .from('branches')
            .select('*');

        if (error) {
            console.error('Supabase findAll error:', error);
            throw error;
        }
        return data || [];
    },

    // 2. Find branch by ID
    async findById(branchId) {
        const parsedId = Number(branchId) || branchId;

        // Try matching id first
        const resId = await supabase
            .from('branches')
            .select('*')
            .eq('id', parsedId);

        if (!resId.error && resId.data && resId.data.length > 0) {
            return resId.data[0];
        }

        // Try matching branch_id
        const resBranchId = await supabase
            .from('branches')
            .select('*')
            .eq('branch_id', parsedId);

        if (!resBranchId.error && resBranchId.data && resBranchId.data.length > 0) {
            return resBranchId.data[0];
        }

        if (resId.error && resBranchId.error) {
            throw resId.error;
        }

        return null;
    },

    // 3. Create new branch
    async create(branchData) {
        const { data, error } = await supabase
            .from('branches')
            .insert([branchData])
            .select();

        if (error) {
            console.error('Supabase create error:', error);
            throw error;
        }
        return data && data.length > 0 ? data[0] : branchData;
    },

    // 4. Update branch
    async update(branchId, updateData) {
        const parsedId = Number(branchId) || branchId;

        // Try updating by id
        const resId = await supabase
            .from('branches')
            .update(updateData)
            .eq('id', parsedId)
            .select();

        if (!resId.error && resId.data && resId.data.length > 0) {
            return resId.data[0];
        }

        // Try updating by branch_id
        const resBranchId = await supabase
            .from('branches')
            .update(updateData)
            .eq('branch_id', parsedId)
            .select();

        if (!resBranchId.error && resBranchId.data && resBranchId.data.length > 0) {
            return resBranchId.data[0];
        }

        // Fallback update without select (in case select() isn't allowed by RLS policy)
        const updateAttempt1 = await supabase
            .from('branches')
            .update(updateData)
            .eq('id', parsedId);

        if (!updateAttempt1.error) {
            return { id: parsedId, branch_id: parsedId, ...updateData };
        }

        const updateAttempt2 = await supabase
            .from('branches')
            .update(updateData)
            .eq('branch_id', parsedId);

        if (!updateAttempt2.error) {
            return { id: parsedId, branch_id: parsedId, ...updateData };
        }

        const err = resId.error || resBranchId.error || updateAttempt1.error || updateAttempt2.error;
        if (err) {
            console.error('Supabase update error:', err);
            throw new Error(err.message || 'Failed to update branch in database');
        }

        return { id: parsedId, branch_id: parsedId, ...updateData };
    },

    // 5. Delete branch
    async delete(branchId) {
        const parsedId = Number(branchId) || branchId;

        const resId = await supabase
            .from('branches')
            .delete()
            .eq('id', parsedId);

        if (!resId.error) return true;

        const resBranchId = await supabase
            .from('branches')
            .delete()
            .eq('branch_id', parsedId);

        if (!resBranchId.error) return true;

        if (resId.error) throw resId.error;
        return true;
    }
};
