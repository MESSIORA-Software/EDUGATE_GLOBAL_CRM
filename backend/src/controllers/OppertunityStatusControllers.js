import { OppertunityStatusService } from '../services/OppertunityStatusService.js';

export const OppertunityStatusController = {

    async createOppertunityStatus(req, res) {
        try {
            const { status_name, stage_order, is_active } = req.body;   
            const newStatus = await OppertunityStatusService.createOppertunityStatus({ status_name, stage_order, is_active });
            res.status(201).json({
                status: 'success',
                message: 'Oppertunity status created successfully',
                data: newStatus,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to create oppertunity status',
                error: error.message,
            });
        }
    },

    async getAllOppertunityStatuses(req, res) {
        try {
            const statuses = await OppertunityStatusService.getAllOppertunityStatuses();    
            res.status(200).json({
                status: 'success',
                message: 'Oppertunity statuses retrieved successfully',
                data: statuses,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve oppertunity statuses',
                error: error.message,
            });
        }
    },

    async updateOppertunityStatus(req, res) {
        try {
            const { status_id } = req.body; 
            const { status_name, stage_order, is_active } = req.body;
            const updatedStatus = await OppertunityStatusService.updateOppertunityStatus(status_id, status_name, stage_order, is_active);
            res.status(200).json({
                status: 'success',
                message: 'Oppertunity status updated successfully',
                data: updatedStatus,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to update oppertunity status',
                error: error.message,
            });
        }
        
    },

    async deleteOppertunityStatus(req, res) {
        try {
            const { status_id } = req.body; 
            const deletedStatus = await OppertunityStatusService.deleteOppertunityStatus(status_id);
            res.status(200).json({
                status: 'success',
                message: 'Oppertunity status deleted successfully',
                data: deletedStatus,
            });
        }   catch (error) {   
            res.status(500).json({
                status: 'error',
                message: 'Failed to delete oppertunity status',
                error: error.message,
            });
        }
    }




}