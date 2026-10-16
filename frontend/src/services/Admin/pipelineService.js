import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://edugate-global-crm.vercel.app/api';
const REQUEST_TIMEOUT_MS = 15000;

// 1. Get all Opportunity Statuses
const getAllOpportunityStatuses = async () => {
  return axios.request({
    method: 'get',
    url: `${BASE_URL}/oppertunity-status/getalloppertunitystatuses`,
    timeout: REQUEST_TIMEOUT_MS,
  });
};

// 2. Create Opportunity Status
const createOpportunityStatus = async (status_name, stage_order = 1, is_active = true) => {
  return axios.request({
    method: 'post',
    url: `${BASE_URL}/oppertunity-status/createoppertunitystatus`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      status_name,
      stage_order: Number(stage_order),
      is_active,
    },
  });
};

// 3. Update Opportunity Status
const updateOpportunityStatus = async (status_id, status_name, stage_order, is_active) => {
  return axios.request({
    method: 'put',
    url: `${BASE_URL}/oppertunity-status/updateoppertunitystatus`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      status_id,
      status_name,
      stage_order: Number(stage_order),
      is_active,
    },
  });
};

// 4. Delete Opportunity Status
const deleteOpportunityStatus = async (status_id) => {
  return axios.request({
    method: 'delete',
    url: `${BASE_URL}/oppertunity-status/deleteoppertunitystatus`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      status_id,
    },
  });
};

// 5. Get Opportunities by Status
const getOpportunitiesByStatus = async (status_id) => {
  return axios.request({
    method: 'get',
    url: `${BASE_URL}/oppertunity/getoppertunitiesbystatus`,
    timeout: REQUEST_TIMEOUT_MS,
    params: {
      status_id,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      status_id,
    },
  });
};

// 6. Create Opportunity (link client to status)
const createOpportunity = async (clientId, statusId, assignedStaffId = null, noteId = null) => {
  return axios.request({
    method: 'post',
    url: `${BASE_URL}/oppertunity/createoppertunity`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      client_id: clientId,
      status_id: statusId,
      assigned_staff_id: assignedStaffId,
      note_id: noteId,
      is_archived: false,
    },
  });
};

// 7. Update Opportunity (change status or staff)
const updateOpportunity = async (opportunityId, clientId, statusId, assignedStaffId = null, noteId = null) => {
  return axios.request({
    method: 'put',
    url: `${BASE_URL}/oppertunity/updateoppertunity`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      opportunity_id: opportunityId,
      client_id: clientId,
      status_id: statusId,
      assigned_staff_id: assignedStaffId,
      note_id: noteId,
      is_archived: false,
    },
  });
};

// 8. Create Opportunity Note
const createOpportunityNote = async (opportunity_id, note, created_by = null) => {
  return axios.request({
    method: 'post',
    url: `${BASE_URL}/oppertunitynotes/createoppertunitynote`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      opportunity_id,
      note,
      created_by,
    },
  });
};

// 9. Update Opportunity Note
const updateOpportunityNote = async (note_id, opportunity_id, note, created_by = null) => {
  return axios.request({
    method: 'put',
    url: `${BASE_URL}/oppertunitynotes/updateoppertunitynote`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      note_id,
      opportunity_id,
      note,
      created_by,
    },
  });
};

// 10. Get Opportunity Note by ID
const getOpportunityNoteById = async (note_id) => {
  return axios.request({
    method: 'get',
    url: `${BASE_URL}/oppertunitynotes/getoppertunitynotebyid`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      note_id,
    },
  });
};

// 11. Delete Opportunity Note
const deleteOpportunityNote = async (note_id) => {
  return axios.request({
    method: 'delete',
    url: `${BASE_URL}/oppertunitynotes/deleteoppertunitynote`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      note_id,
    },
  });
};

export default {
  getAllOpportunityStatuses,
  createOpportunityStatus,
  updateOpportunityStatus,
  deleteOpportunityStatus,
  getOpportunitiesByStatus,
  createOpportunity,
  updateOpportunity,
  createOpportunityNote,
  updateOpportunityNote,
  getOpportunityNoteById,
  deleteOpportunityNote,
};
