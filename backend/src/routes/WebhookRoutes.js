import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController.js';

const router = Router();

// Facebook Messenger Webhook verification and event receiver
router.get('/facebook', WebhookController.verifyFacebookWebhook);
router.post('/facebook', WebhookController.handleFacebookWebhook);

// WhatsApp Cloud API Webhook verification and event receiver
router.get('/whatsapp', WebhookController.verifyWhatsAppWebhook);
router.post('/whatsapp', WebhookController.handleWhatsAppWebhook);

export default router;

