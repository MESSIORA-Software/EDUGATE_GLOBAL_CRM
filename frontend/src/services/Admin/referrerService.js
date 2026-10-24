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

// 7. Get Referrer Students and Payment Calculation
const getReferrerStudents = async (referrerId) => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/referrers/${referrerId}/students`,
  });
};

// 8. Get Referral Payment Settings
const getPaymentSettings = async () => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/referrers/payment-settings`,
  });
};

// 9. Update Referral Payment Settings
const updatePaymentSettings = async ({ rate_per_student, currency = 'LKR', apply_to_all = true }) => {
  return apiRequest({
    method: 'put',
    url: `${BASE_URL}/referrers/payment-settings`,
    data: {
      rate_per_student,
      currency,
      apply_to_all,
    },
  });
};

// 10. Record Payout Settlement
const addPayout = async (referrerId, { amount, payment_method, reference_note }) => {
  return apiRequest({
    method: 'post',
    url: `${BASE_URL}/referrers/${referrerId}/payouts`,
    data: {
      amount,
      payment_method,
      reference_note,
    },
  });
};

// 11. Get Referrer Payouts History
const getPayouts = async (referrerId) => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/referrers/${referrerId}/payouts`,
  });
};

export default {
  getNextCode,
  createReferrer,
  getAllReferrers,
  getReferrerById,
  updateReferrer,
  deleteReferrer,
  getReferrerStudents,
  getPaymentSettings,
  updatePaymentSettings,
  addPayout,
  getPayouts,
};
