import { ClientRepository } from '../repositories/ClientRepository.js';

export const ClientService = {

async createClient({ name, email, dob, source, referrer_id = null }) {
    const clientData = {
        name: name,
        email: email,
        dob: dob,
        source: source,
        referrer_id: referrer_id ? Number(referrer_id) : null,
        created_at: new Date()
    };

    return await ClientRepository.createClient(clientData);
},

async getAllClients(currentUser = null) {
    return await ClientRepository.getAllClients(currentUser);
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

async updateClient(client_id, { name, email, dob, source, referrer_id }) {

    await this.getClientById(client_id); // Ensure the client exists before updating

    const updatedData = {
        name: name,
        email: email,
        dob: dob,
        source: source
    };
    if (referrer_id !== undefined) {
        updatedData.referrer_id = referrer_id ? Number(referrer_id) : null;
    }
    const updatedClient = await ClientRepository.updateClient(client_id, updatedData);
    return updatedClient;
},

async deleteClient(client_id) {
    await this.getClientById(client_id); // Ensure the client exists before deleting

    const deletedClient = await ClientRepository.deleteClient(client_id);
    return deletedClient;
}

}
