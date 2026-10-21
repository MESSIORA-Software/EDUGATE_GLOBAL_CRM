import { Router } from 'express';
import { ClientController } from '../controllers/ClientController.js';
import { optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/createclient', optionalAuthenticateToken, ClientController.createClient);
router.get('/getallclients', optionalAuthenticateToken, ClientController.getAllClients);
router.get('/getclientbyid', optionalAuthenticateToken, ClientController.getClientById);
router.put('/updateclient', optionalAuthenticateToken, ClientController.updateClient);
router.delete('/deleteclient', optionalAuthenticateToken, ClientController.deleteClient);

export default router;
