import { ClientRepository } from '../repositories/ClientRepository.js';

export const ClientService = {

async createClient({ name, email, dob, source, created_by = null }) {
    const clientData = {
        name: name,
        email: email,
        dob: dob,
        source: source, 
        created_by: created_by,
        created_at: new Date()
    };

    return await ClientRepository.createClient(clientData);
},

async getAllClients() {
    return await ClientRepository.getAllClients();
},

async getClientById(client_id) {
    const client = await ClientRepository.getClientById(client_id);
    if (!client) {
        const error = new Error(`Client with ID '${client_id}' not found`);
        error.statusCode = 404;
        throw error;
    }
    return client;
},

async updateClient(client_id, { name, email, dob, source }) {

    await this.getClientById(client_id); // Ensure the client exists before updating

    const updatedData = {
        name: name,
        email: email,
        dob: dob,
        source: source
    };
    const updatedClient = await ClientRepository.updateClient(client_id, updatedData);
    return updatedClient;
},

async deleteClient(client_id) {
    await this.getClientById(client_id); // Ensure the client exists before deleting

    const deletedClient = await ClientRepository.deleteClient(client_id);
    return deletedClient;
}

}
