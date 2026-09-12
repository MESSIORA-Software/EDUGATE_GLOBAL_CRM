import { OppertunityNoteService } from '../services/OppertunityNoteService.js';


export const OppertunityNoteController = {

    async createOppertunityNote(req, res, next) {
        try {
            const { opportunity_id, note, created_by } = req.body;     
            const newOppertunityNote = await OppertunityNoteService.createOppertunityNote({ opportunity_id, note, created_by });
            res.status(201).json({
                status: 'success',
                message: 'Opportunity note created successfully',
                data: newOppertunityNote,
            });
        } catch (error) {
            next(error);
        }

    },

    async updateOppertunityNote(req, res, next) {
        try {
            const { note_id } = req.body;
            const { opportunity_id, note, created_by } = req.body;

            const updatedOppertunityNote = await OppertunityNoteService.updateOppertunityNote(note_id, { opportunity_id, note, created_by });
            res.status(200).json({
                status: 'success',
                message: 'Opportunity note updated successfully',
                data: updatedOppertunityNote,
            });
        } catch (error) {
            next(error);
        }

    },

    async getOppertunityNoteById(req, res, next) {
        try {
            const { note_id } = req.body;
            const oppertunityNote = await OppertunityNoteService.getOppertunityNoteById(note_id);
            res.status(200).json({
                status: 'success',
                message: 'Opportunity note fetched successfully',
                data: oppertunityNote,
            });
        } catch (error) {
            next(error);
        }
    }

}