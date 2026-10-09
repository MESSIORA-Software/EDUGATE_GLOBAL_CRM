import { MessageService } from '../services/MessageService.js';

export const MessageController = {
    // GET /api/conversations/:id/messages
    async getMessages(req, res, next) {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const messages = await MessageService.getMessages(id, limit, offset);
            res.status(200).json({
                status: 'success',
                count: messages.length,
                data: messages
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/:id/messages (Send WhatsApp / Messenger chat)
    async sendMessage(req, res, next) {
        try {
            const { id } = req.params;
            const { content, media_url, media_source, message_type } = req.body;
            const message = await MessageService.sendMessage(id, req.user, { content, media_url, media_source, message_type });
            res.status(201).json({
                status: 'success',
                message: 'Message sent successfully',
                data: message
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/:id/call-log (Record Call log / SMS record)
    async logCallOrSMS(req, res, next) {
        try {
            const { id } = req.params;
            const { sender_type, content, call_metadata, message_type } = req.body;
            const log = await MessageService.logCallOrSMS(id, { sender_type, content, call_metadata, message_type });
            res.status(201).json({
                status: 'success',
                message: 'Call/SMS log saved successfully',
                data: log
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/conversations/media/upload
    async uploadMedia(req, res, next) {
        try {
            const result = await MessageService.uploadMedia(req.file);
            res.status(200).json({
                status: 'success',
                message: 'Media uploaded successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
};
