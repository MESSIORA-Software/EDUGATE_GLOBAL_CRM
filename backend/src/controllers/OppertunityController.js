import { OppertunityService } from '../services/OppertunityService.js';

export const OppertunityController = {  

    async createOppertunity(req, res) {
        try {
            const { client_id, assigned_staff_id, status_id, note_id, is_archived, created_by, updated_by } = req.body;   
            const newOppertunity = await OppertunityService.createOppertunity({ client_id, assigned_staff_id, status_id, note_id, is_archived, created_by, updated_by });
            res.status(201).json({
                status: 'success',
                message: 'Oppertunity created successfully',
                data: newOppertunity,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to create oppertunity status',
                error: error.message,
            });
        }
        
    },

    async updateOppertunity(req, res) {
        try {
            const { opportunity_id, client_id, assigned_staff_id, status_id, note_id, is_archived, created_by, updated_by } = req.body;
             if (!opportunity_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Field "opportunity_id" is required.',
                });
            }
            const updatedOppertunity = await OppertunityService.updateOppertunity(opportunity_id, { client_id, assigned_staff_id, status_id, note_id, is_archived, created_by, updated_by });
            res.status(200).json({
                status: 'success',
                message: 'Oppertunity updated successfully',
                data: updatedOppertunity,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to update oppertunity',
                error: error.message,
            });
        }
    },

    async getOppertunityById(req, res) {
        try {
            const { opportunity_id } = req.body;
            const oppertunity = await OppertunityService.getOppertunityById(opportunity_id);
            res.status(200).json({
                status: 'success',
                message: 'Oppertunity fetched successfully',
                data: oppertunity,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch oppertunity',
                error: error.message,
            });
        }
    },

    async getOppertunitiesbyoppertunityStatus(req, res) {
        try {
            const { status_id } = req.body;
            const opportunities = await OppertunityService.getOppertunitiesbyoppertunityStatus(status_id);
            res.status(200).json({
                status: 'success',
                message: 'Opportunities fetched successfully',
                data: opportunities,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch opportunities',
                error: error.message,
            });
        }
    }

};