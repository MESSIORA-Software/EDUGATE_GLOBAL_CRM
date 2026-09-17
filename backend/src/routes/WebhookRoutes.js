import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController.js';

const router = Router();

// Facebook Messenger Webhook verification and event receiver
router.get('/facebook', WebhookController.verifyFacebookWebhook);
router.post('/facebook', WebhookController.handleFacebookWebhook);

export default router;
