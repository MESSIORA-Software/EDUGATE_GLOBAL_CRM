import { Router } from 'express';
import { ClientController } from '../controllers/ClientController.js';

const router = Router();

// 1. Create Client
router.post('/createclient', ClientController.createClient);

// 2. Find all clients
router.get('/getallclients', ClientController.getAllClients);

// 3. Find Clients by id
router.get('/getclientbyid/:client_id?', ClientController.getClientById);
router.get('/getclientbyid', ClientController.getClientById);
router.post('/getclientbyid', ClientController.getClientById);

// 4. Update Client
router.put('/updateclient', ClientController.updateClient);
router.post('/updateclient', ClientController.updateClient);

// 5. Delete Client
router.delete('/deleteclient/:client_id?', ClientController.deleteClient);
router.delete('/deleteclient', ClientController.deleteClient);

export default router;
