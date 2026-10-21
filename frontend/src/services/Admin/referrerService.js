import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://edugate-global-crm.vercel.app/api';
const REQUEST_TIMEOUT_MS = 15000;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiRequest = (options) => {
  return axios.request({
    ...options,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
};

// 1. Fetch next auto-generated Referrer Code (e.g. EDUGATE_REFERRER_01)
const getNextCode = async () => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/referrers/next-code`,
  });
};

// 2. Create new Referrer
const createReferrer = async ({
  name,
  email,
  home_address,
  whatsapp_number,
  phone_number,
  note,
  status = 'Active',
}) => {
  return apiRequest({
    method: 'post',
    url: `${BASE_URL}/referrers/create`,
    data: {
      name,
      email,
      home_address,
      whatsapp_number,
      phone_number,
      note,
      status,
    },
  });
};

// 3. Get all Referrers
const getAllReferrers = async () => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/referrers/getall`,
  });
};

// 4. Get Referrer by ID
const getReferrerById = async (referrerId) => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/referrers/${referrerId}`,
  });
};

// 5. Update Referrer
const updateReferrer = async (referrerId, data) => {
  return apiRequest({
    method: 'put',
    url: `${BASE_URL}/referrers/update`,
    data: {
      referrer_id: referrerId,
      ...data,
    },
  });
};

// 6. Delete Referrer
const deleteReferrer = async (referrerId) => {
  return apiRequest({
    method: 'delete',
    url: `${BASE_URL}/referrers/delete`,
    data: {
      referrer_id: referrerId,
    },
  });
};

export default {
  getNextCode,
  createReferrer,
  getAllReferrers,
  getReferrerById,
  updateReferrer,
  deleteReferrer,
};
