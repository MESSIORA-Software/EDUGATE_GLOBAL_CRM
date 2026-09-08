import { Router } from 'express';
import { ClientController } from '../controllers/ClientController.js';


const router = Router();

router.post('/createclient', ClientController.createClient);
router.get('/getallclients', ClientController.getAllClients);
router.get('/getclientbyid', ClientController.getClientById);
router.put('/updateclient', ClientController.updateClient);
router.delete('/deleteclient', ClientController.deleteClient);

export default router;