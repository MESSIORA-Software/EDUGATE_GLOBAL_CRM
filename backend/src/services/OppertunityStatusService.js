import { OppertunityStatusRepository } from '../repositories/OppertunityStatusRepository.js';
import { ReferralRepository } from '../repositories/ReferralRepository.js';

export const OppertunityStatusService = {
  async createOppertunityStatus({ status_name, stage_order, is_active }) {
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

  async updateOppertunityStatus(status_id, status_name, stage_order, is_active) {
    if (is_active === false) {
      const config = await ReferralRepository.getCommissionTriggerStageConfig();
      if (config && Number(config.commission_trigger_stage_id) === Number(status_id)) {
        const error = new Error(
          'Cannot deactivate this pipeline stage because it is currently configured as the Referral Commission Trigger Stage. Please reconfigure the referral trigger stage first.'
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const updatedData = {
      status_name: status_name,
      stage_order: stage_order,
      is_active: is_active ?? true,
    };
    return await OppertunityStatusRepository.updateOppertunityStatus(status_id, updatedData);
  },

  async deleteOppertunityStatus(status_id) {
    const config = await ReferralRepository.getCommissionTriggerStageConfig();
    if (config && Number(config.commission_trigger_stage_id) === Number(status_id)) {
      const error = new Error(
        'Cannot delete this pipeline stage because it is currently configured as the Referral Commission Trigger Stage. Please reconfigure the referral trigger stage first.'
      );
      error.statusCode = 400;
      throw error;
    }

    return await OppertunityStatusRepository.deleteOppertunityStatus(status_id);
  },
};
