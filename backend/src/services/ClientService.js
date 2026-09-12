import { ClientRepository } from '../repositories/ClientRepository.js';

export const ClientService = {
    async getAllClients() {
        return await ClientRepository.findAll();
    },

    async getClientById(clientId) {
        if (!clientId) {
            const error = new Error('Client ID is required.');
            error.statusCode = 400;
            throw error;
        }

        const client = await ClientRepository.findById(clientId);
        if (!client) {
            const error = new Error(`Client with ID '${clientId}' not found.`);
            error.statusCode = 404;
            throw error;
        }

        return client;
    },

    async createClient({ name, email, dob, source }) {
        if (!name || !email) {
            const error = new Error('Fields "name" and "email" are required.');
            error.statusCode = 400;
            throw error;
        }

        return await ClientRepository.create({
            name: name.trim(),
            email: email.trim(),
            dob: dob ? String(dob).trim() : null,
            source: source ? String(source).trim() : null,
        });
    },

    async updateClient(clientId, { name, email, dob, source }) {
        if (!clientId) {
            const error = new Error('Field "client_id" is required for updating client.');
            error.statusCode = 400;
            throw error;
        }

        const updatePayload = {};
        if (name) updatePayload.name = name.trim();
        if (email) updatePayload.email = email.trim();
        if (dob) updatePayload.dob = String(dob).trim();
        if (source) updatePayload.source = String(source).trim();

        return await ClientRepository.update(clientId, updatePayload);
    },

    async deleteClient(clientId) {
        if (!clientId) {
            const error = new Error('Client ID is required for deletion.');
            error.statusCode = 400;
            throw error;
        }

        return await ClientRepository.delete(clientId);
    }
};
