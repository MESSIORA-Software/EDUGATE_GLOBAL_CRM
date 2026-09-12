import { ClientService } from '../services/ClientService.js';

export const ClientController = {
    // 1. Create Client (POST /api/clients/createclient)
    async createClient(req, res, next) {
        try {
            const { name, email, dob, source } = req.body || {};
            const newClient = await ClientService.createClient({ name, email, dob, source });

            res.status(201).json({
                status: 'success',
                message: 'Client created successfully',
                data: newClient,
            });
        } catch (error) {
            next(error);
        }
    },

    // 2. Find All Clients (GET /api/clients/getallclients)
    async getAllClients(req, res, next) {
        try {
            const clients = await ClientService.getAllClients();

            res.status(200).json({
                status: 'success',
                count: clients.length,
                data: clients,
            });
        } catch (error) {
            next(error);
        }
    },

    // 3. Find Client by ID (GET /api/clients/getclientbyid)
    async getClientById(req, res, next) {
        try {
            const client_id = req.params.client_id || req.query.client_id || req.body?.client_id;

            if (!client_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "client_id" is required.',
                });
            }

            const client = await ClientService.getClientById(client_id);

            res.status(200).json({
                status: 'success',
                data: client,
            });
        } catch (error) {
            next(error);
        }
    },

    // 4. Update Client (PUT /api/clients/updateclient)
    async updateClient(req, res, next) {
        try {
            const { client_id, name, email, dob, source } = req.body || {};

            if (!client_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "client_id" is required in request body.',
                });
            }

            const updatedClient = await ClientService.updateClient(client_id, { name, email, dob, source });

            res.status(200).json({
                status: 'success',
                message: 'Client updated successfully',
                data: updatedClient,
            });
        } catch (error) {
            next(error);
        }
    },

    // 5. Delete Client (DELETE /api/clients/deleteclient)
    async deleteClient(req, res, next) {
        try {
            const client_id = req.params.client_id || req.body?.client_id || req.query.client_id;

            if (!client_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "client_id" is required.',
                });
            }

            await ClientService.deleteClient(client_id);

            res.status(200).json({
                status: 'success',
                message: `Client '${client_id}' deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    }
};
