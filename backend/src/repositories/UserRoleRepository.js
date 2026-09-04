import { supabase } from '../database/supabaseClient.js';

export const roleRepository = {

    // 1. Get all roles
    async findAll() {
        const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // 2. Find role by ID
    async findById(roleId) {
        const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .eq('role_id', roleId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // 3. Create new role
    async create(roleData) {
        const { data, error } = await supabase
            .from('user_roles')
            .insert([roleData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 4. Update role
    async update(roleId, updateData) {
        const { data, error } = await supabase
            .from('user_roles')
            .update(updateData)
            .eq('role_id', roleId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 5. Delete role
    async delete(roleId) {
        const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('role_id', roleId);

        if (error) throw error;
        return true;
    }
};
