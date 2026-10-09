import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController.js';
import { MessageController } from '../controllers/MessageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Inbound webhook/simulation
router.post('/inbound', ConversationController.handleInbound);

// All routes below require JWT Authentication
router.use(authenticateToken);

// Conversation threads
router.get('/', ConversationController.getConversations);
router.get('/client/:client_id', ConversationController.getClientConversations);
router.get('/:id', ConversationController.getConversationDetails);
router.patch('/:id/assign', ConversationController.assignStaff);
router.put('/client/:client_id', ConversationController.updateClientDetails);

// Messages & Call logs
router.get('/:id/messages', MessageController.getMessages);
router.post('/:id/messages', MessageController.sendMessage);
router.post('/:id/call-log', MessageController.logCallOrSMS);

export default router;
