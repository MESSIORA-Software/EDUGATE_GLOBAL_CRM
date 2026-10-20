import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController.js';
import { MessageController } from '../controllers/MessageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadMiddleware, validateFile } from '../validators/MediaValidator.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

// Internal / simulated inbound ingestion. Previously unauthenticated (anyone could
// create clients, messages and notification events). Real provider traffic enters
// through /api/webhooks/* with signature verification; this one is admin-only.
router.post('/inbound', authenticateToken, requireAdmin, ConversationController.handleInbound);

// All routes below require JWT Authentication
router.use(authenticateToken);

router.post('/media/upload', uploadMiddleware, validateFile, MessageController.uploadMedia);

// Conversation threads
router.get('/', ConversationController.getConversations);
router.get('/client/:client_id', ConversationController.getClientConversations);
router.get('/:id', ConversationController.getConversationDetails);
router.patch('/:id/assign', ConversationController.assignStaff);
router.put('/client/:client_id', ConversationController.updateClientDetails);
router.post('/:id/opportunity', ConversationController.createOpportunityFromConversation);

// WhatsApp Linked Device (QR Code) management
router.get('/whatsapp/status', ConversationController.getWhatsAppStatus);
router.post('/whatsapp/connect', ConversationController.connectWhatsApp);
router.post('/whatsapp/disconnect', ConversationController.disconnectWhatsApp);

// Gmail Email Channel management
router.get('/email/status', ConversationController.getEmailStatus);
router.post('/email/sync', ConversationController.syncEmails);

// Messages & Call logs
router.get('/:id/messages', MessageController.getMessages);
router.post('/:id/messages', MessageController.sendMessage);
router.post('/:id/call-log', MessageController.logCallOrSMS);

export default router;


