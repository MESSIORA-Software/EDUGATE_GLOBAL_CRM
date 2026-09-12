import { OppertunityNoteRepository } from '../repositories/OppertunityNoteRepository.js';

export const OppertunityNoteService = {


    async createOppertunityNote({ opportunity_id, note, created_by }) {  
        
        const oppertunityNoteData = {
            opportunity_id: opportunity_id,
            note: note,
            created_by: created_by
        };

        return await OppertunityNoteRepository.createOppertunityNote(oppertunityNoteData);

    },
    
    async updateOppertunityNote(note_id,{ opportunity_id, note, created_by }) {

        const updatedData = {
            opportunity_id: opportunity_id,
            note: note,
            created_by: created_by
        };

        return await OppertunityNoteRepository.updateOppertunityNote(note_id, updatedData);

    },

    async getOppertunityNoteById(note_id) {
        return await OppertunityNoteRepository.getOppertunityNoteById(note_id);
    }

}