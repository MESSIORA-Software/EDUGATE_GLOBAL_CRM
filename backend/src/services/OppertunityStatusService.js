import { OppertunityStatusRepository } from '../repositories/OppertunityStatusRepository.js';

export const OppertunityStatusService = {

async createOppertunityStatus({ status_name,stage_order,is_active }) {
    const statusData = {
            status_name: status_name,
            stage_order: stage_order,
            is_active: is_active ?? true, 
    };

    return await OppertunityStatusRepository.createOppertunityStatus(statusData);
},

async getAllOppertunityStatuses() {
    return await OppertunityStatusRepository.getAllOppertunityStatuses();
},

async updateOppertunityStatus(status_id, status_name,stage_order,is_active) {
    const updatedData = {
        status_name: status_name,
        stage_order: stage_order,
        is_active: is_active ?? true,
    };
    return await OppertunityStatusRepository.updateOppertunityStatus(status_id, updatedData);

},

async deleteOppertunityStatus(status_id) {
    return await OppertunityStatusRepository.deleteOppertunityStatus(status_id);
}



}