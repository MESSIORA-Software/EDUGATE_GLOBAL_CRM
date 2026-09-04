import { supabase } from '../database/supabaseClient.js';


export const UserRepository = {
    // Find all users
      async findusers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Find a user by ID
    async finduserbyid(user_id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: true })
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // Create a new user
     async createuser(UserData) {
        const { data, error } = await supabase
            .from('users')
            .insert([UserData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update an existing user
     async updateuser(user_id, updateuserData) {
        const { data, error } = await supabase
            .from('users')
            .update(updateuserData)
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;
        return data; 
    },

    // Delete a user
    async deleteUser(user_id) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', user_id);

        if (error) throw error;
        return true;
    }

};
