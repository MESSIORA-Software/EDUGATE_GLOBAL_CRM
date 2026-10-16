import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController.js';
import { MessageController } from '../controllers/MessageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

// Internal / simulated inbound ingestion. Previously unauthenticated (anyone could
// create clients, messages and notification events). Real provider traffic enters
// through /api/webhooks/* with signature verification; this one is admin-only.
router.post('/inbound', authenticateToken, requireAdmin, ConversationController.handleInbound);

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
