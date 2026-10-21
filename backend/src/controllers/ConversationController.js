import { ConversationService } from '../services/ConversationService.js';
import { WhatsAppBaileysService } from '../services/WhatsAppBaileysService.js';
import { EmailService } from '../services/EmailService.js';
import { FacebookMessengerService } from '../services/FacebookMessengerService.js';



export const ConversationController = {
    // GET /api/conversations?channel=messenger (or ?channel=whatsapp / ?channel=sms / ?channel=call / ?client_id=1)
    async getConversations(req, res, next) {
        try {
            const filters = {
                channel: req.query.channel,
                client_id: req.query.client_id,
                status: req.query.status
            };
            const conversations = await ConversationService.getConversations(req.user, filters);
            res.status(200).json({
                status: 'success',
                count: conversations.length,
                data: conversations
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/conversations/:id
    async getConversationDetails(req, res, next) {
        try {
            const { id } = req.params;
            const conversation = await ConversationService.getConversationDetails(id, req.user);
            res.status(200).json({
                status: 'success',
                data: conversation
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/conversations/client/:client_id
    async getClientConversations(req, res, next) {
        try {
            const { client_id } = req.params;
            const conversations = await ConversationService.getClientConversations(client_id);
            res.status(200).json({
                status: 'success',
                count: conversations.length,
                data: conversations
            });
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/conversations/:id/assign
    async assignStaff(req, res, next) {
        try {
            const { id } = req.params;
            const { staff_id } = req.body;
            if (!staff_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "staff_id" is required.'
                });
            }
            const conversationId = Number(id);
            const staffId = Number(staff_id);
            if (!Number.isSafeInteger(conversationId) || conversationId <= 0 ||
                !Number.isSafeInteger(staffId) || staffId <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Conversation id and "staff_id" must be positive integers.'
                });
            }
            const updated = await ConversationService.assignStaff(conversationId, staffId, req.user);
            res.status(200).json({
                status: 'success',
                message: 'Staff assigned successfully',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/conversations/client/:client_id
    async updateClientDetails(req, res, next) {
        try {
            const { client_id } = req.params;
            const { name, email, dob, source } = req.body;
            const updatedClient = await ConversationService.updateClientDetails(client_id, { name, email, dob, source });
            res.status(200).json({
                status: 'success',
                message: 'Client details updated successfully',
                data: updatedClient
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/:id/opportunity
    async createOpportunityFromConversation(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, dob, source, status_id, assigned_staff_id, note } = req.body;
            const result = await ConversationService.createOpportunityFromConversation(id, req.user, {
                name, email, dob, source, status_id, assigned_staff_id, note
            });
            res.status(201).json({
                status: 'success',
                message: 'Student registered and opportunity created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/inbound
    async handleInbound(req, res, next) {
        try {
            const result = await ConversationService.handleInboundCommunication(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Inbound message processed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/conversations/whatsapp/status
    async getWhatsAppStatus(req, res, next) {
        try {
            const status = WhatsAppBaileysService.getStatus();
            res.status(200).json({
                status: 'success',
                data: status
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/whatsapp/connect
    async connectWhatsApp(req, res, next) {
        try {
            const status = await WhatsAppBaileysService.initialize();
            res.status(200).json({
                status: 'success',
                message: 'WhatsApp initialization started',
                data: status
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/whatsapp/disconnect
    async disconnectWhatsApp(req, res, next) {
        try {
            const result = await WhatsAppBaileysService.logout();
            res.status(200).json({
                status: 'success',
                message: 'WhatsApp disconnected successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/conversations/email/status
    async getEmailStatus(req, res, next) {
        try {
            const status = await EmailService.testConnection();
            res.status(200).json({
                status: 'success',
                data: status
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/email/sync
    async syncEmails(req, res, next) {
        try {
            const result = await EmailService.syncIncomingEmails();
            res.status(200).json({
                status: 'success',
                message: `Email sync completed. Processed ${result.processedCount} email(s).`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/conversations/messenger/status
    async getMessengerStatus(req, res, next) {
        try {
            const status = await FacebookMessengerService.getStatus();
            res.status(200).json({
                status: 'success',
                data: status
            });
        } catch (error) {
            next(error);
        }
    }
};


