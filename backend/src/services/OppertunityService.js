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

        const created = await OppertunityRepository.createOppertunity(oppertunityData);

        // Check if new opportunity qualifies a referred student
        if (client_id && status_id) {
            try {
                const { ReferralService } = await import('./ReferralService.js');
                await ReferralService.checkAndQualifyReferral({
                    clientId: Number(client_id),
                    statusId: Number(status_id),
                    actorId: created_by,
                });
            } catch (qualErr) {
                console.warn('[OppertunityService] Referral qualification check notice:', qualErr.message);
            }
        }

        return created;
    },

    async updateOppertunity(opportunity_id, {client_id, assigned_staff_id, status_id, note_id, is_archived, created_by, updated_by }) {

        const updatedData = {};
        if (client_id !== undefined) updatedData.client_id = client_id;
        if (assigned_staff_id !== undefined) updatedData.assigned_staff_id = assigned_staff_id;
        if (status_id !== undefined) updatedData.status_id = status_id;
        if (note_id !== undefined) updatedData.note_id = note_id;
        if (is_archived !== undefined) updatedData.is_archived = is_archived;
        if (created_by !== undefined) updatedData.created_by = created_by;
        if (updated_by !== undefined) updatedData.updated_by = updated_by;

        const updated = await OppertunityRepository.updateOppertunity(opportunity_id, updatedData);

        // Whenever stage/status changes, trigger referral qualification check
        if (status_id !== undefined) {
            let targetClientId = client_id;
            if (!targetClientId) {
                try {
                    const existing = await OppertunityRepository.getOppertunityById(opportunity_id);
                    targetClientId = existing?.client_id;
                } catch (e) {
                    // ignore
                }
            }

            if (targetClientId) {
                try {
                    const { ReferralService } = await import('./ReferralService.js');
                    await ReferralService.checkAndQualifyReferral({
                        clientId: Number(targetClientId),
                        statusId: Number(status_id),
                        actorId: updated_by,
                    });
                } catch (qualErr) {
                    console.warn('[OppertunityService] Referral qualification check notice:', qualErr.message);
                }
            }
        }

        return updated;

    },

    async getOppertunityById(opportunity_id) {
        return await OppertunityRepository.getOppertunityById(opportunity_id);
    },

    async getOppertunitiesbyoppertunityStatus(status_id, staffId = null) {
        return await OppertunityRepository.getOppertunitiesbyoppertunityStatus(status_id, staffId);
    }

};  