import { ReferrerRepository } from '../repositories/ReferrerRepository.js';

export const ReferrerService = {
  async getNextCode() {
    return await ReferrerRepository.getNextReferrerCode();
  },

  async createReferrer({
    name,
    email,
    home_address,
    whatsapp_number,
    phone_number,
    note,
    status = 'Active',
    created_by,
  }) {
    if (!name || !name.trim()) {
      throw new Error('Name is required for referrer.');
    }

    const nextCode = await ReferrerRepository.getNextReferrerCode();

    const referrerData = {
      referrer_code: nextCode,
      name: name.trim(),
      email: email ? email.trim() : null,
      home_address: home_address ? home_address.trim() : null,
      whatsapp_number: whatsapp_number ? whatsapp_number.trim() : null,
      phone_number: phone_number ? phone_number.trim() : null,
      note: note ? note.trim() : null,
      status: status || 'Active',
      created_by: created_by ? Number(created_by) : null,
    };

    return await ReferrerRepository.createReferrer(referrerData);
  },

  async getAllReferrers() {
    return await ReferrerRepository.getAllReferrers();
  },

  async getReferrerById(referrerId) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');
    return await ReferrerRepository.getReferrerById(Number(referrerId));
  },

  async updateReferrer(referrerId, updatePayload) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');

    const cleanData = {};
    if (updatePayload.name !== undefined) cleanData.name = updatePayload.name?.trim();
    if (updatePayload.email !== undefined) cleanData.email = updatePayload.email ? updatePayload.email.trim() : null;
    if (updatePayload.home_address !== undefined) cleanData.home_address = updatePayload.home_address ? updatePayload.home_address.trim() : null;
    if (updatePayload.whatsapp_number !== undefined) cleanData.whatsapp_number = updatePayload.whatsapp_number ? updatePayload.whatsapp_number.trim() : null;
    if (updatePayload.phone_number !== undefined) cleanData.phone_number = updatePayload.phone_number ? updatePayload.phone_number.trim() : null;
    if (updatePayload.note !== undefined) cleanData.note = updatePayload.note ? updatePayload.note.trim() : null;
    if (updatePayload.status !== undefined) cleanData.status = updatePayload.status;

    return await ReferrerRepository.updateReferrer(Number(referrerId), cleanData);
  },

  async deleteReferrer(referrerId) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');
    return await ReferrerRepository.deleteReferrer(Number(referrerId));
  },

  async getReferrerStudents(referrerId) {
    if (!referrerId) throw new Error('Field "referrer_id" is required.');
    const referrer = await ReferrerRepository.getReferrerById(Number(referrerId));
    let students = await ReferrerRepository.getStudentsByReferrerId(Number(referrerId));

    const score = (students?.length || 0) * 10;
    return {
      referrer,
      students,
      total_students: students?.length || 0,
      score,
    };
  },
};
