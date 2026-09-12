import { OppertunityRepository } from '../repositories/OppertunityRepository.js';

export const OppertunityService = {

    async createOppertunity({ client_id, assigned_staff_id, status_id, note_id, is_archived, created_by, updated_by }) {    
        
        const oppertunityData = {
            client_id : client_id,
            assigned_staff_id : assigned_staff_id,
            status_id : status_id,
            note_id : note_id,
            is_archived : is_archived ?? true,
            created_by: created_by, 
            updated_by : updated_by,
        };

        return await OppertunityRepository.createOppertunity(oppertunityData);
    },

    async updateOppertunity(opportunity_id, {client_id, assigned_staff_id, status_id, note_id, is_archived, created_by, updated_by }) {

        const updatedData = {
            client_id : client_id,
            assigned_staff_id : assigned_staff_id,
            status_id : status_id,
            note_id : note_id,
            is_archived : is_archived ?? true,
            created_by: created_by, 
            updated_by : updated_by,
        };

        return await OppertunityRepository.updateOppertunity(opportunity_id, updatedData);

    },

    async getOppertunityById(opportunity_id) {
        return await OppertunityRepository.getOppertunityById(opportunity_id);
    },

    async getOppertunitiesbyoppertunityStatus(status_id) {
        return await OppertunityRepository.getOppertunitiesbyoppertunityStatus(status_id);
    }

};  