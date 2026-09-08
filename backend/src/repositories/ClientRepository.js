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

async getAllClients() {
    const { data, error } = await supabase
        .from('clients')
        .select('*');
    if (error) throw error;
    return data;
},

async getClientById(client_id) {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
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