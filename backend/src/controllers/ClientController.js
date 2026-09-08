import { ClientService } from '../services/ClientService.js';

export const ClientController = {
    
async createClient(req, res, next) {
    try {
        const { name, email, dob, source } = req.body;  
        const newClient = await ClientService.createClient({ name, email, dob, source });
        res.status(201).json({
            status: 'success',
            message: 'Client created successfully',
            data: newClient,
        });
    }   catch (error) {
        next(error);
    }
},

async getAllClients(req, res, next) {
    try {
        const clients = await ClientService.getAllClients();
        res.status(200).json({
            status: 'success',
            data: clients,
        });
    } catch (error) {
        next(error);
    }
},
 async getClientById(req, res, next) {
    try {
        const { client_id } = req.body;

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

async updateClient(req, res, next) {
    try {
        const { client_id, name, email, dob, source } = req.body;

         if (!client_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "client_id" is required.',
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

async deleteClient(req, res, next) {
    try {
        const { client_id } = req.body;
        if (!client_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Field "client_id" is required.',
            });
        }   

        const deletedClient = await ClientService.deleteClient(client_id);
        res.status(200).json({
            status: 'success',
            message: 'Client deleted successfully',
            data: deletedClient,
        });
    } catch (error) {
        next(error);
    }   
}

}