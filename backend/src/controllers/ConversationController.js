import { ConversationService } from '../services/ConversationService.js';

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
            const updated = await ConversationService.assignStaff(id, staff_id);
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

    // POST /api/conversations/:id/create-opportunity (Triggered by "Create Opportunity" button)
    async createOpportunity(req, res, next) {
        try {
            const { id } = req.params;
            const { status_id, note_id } = req.body;
            const opportunity = await ConversationService.createOpportunityFromConversation(id, req.user, { status_id, note_id });
            res.status(201).json({
                status: 'success',
                message: 'Opportunity created successfully for this conversation client',
                data: opportunity
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
    }
};
