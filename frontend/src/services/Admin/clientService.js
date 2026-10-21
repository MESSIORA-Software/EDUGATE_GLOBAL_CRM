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

// 1. Create Client
const createClient = async (name, email, dob, source) => {
  return apiRequest({
    method: 'post',
    url: `${BASE_URL}/clients/createclient`,
    data: {
      name,
      email,
      dob,
      source,
    },
  });
};

// 2. Find all clients
const getAllClients = async () => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/clients/getallclients`,
  });
};

// 3. Find Clients by ID
const getClientById = async (clientId) => {
  return apiRequest({
    method: 'get',
    url: `${BASE_URL}/clients/getclientbyid/${clientId}`,
    params: {
      client_id: clientId,
    },
  });
};

// 4. Update Client
const updateClient = async (clientId, name, email, dob, source) => {
  return apiRequest({
    method: 'put',
    url: `${BASE_URL}/clients/updateclient`,
    data: {
      client_id: clientId,
      name,
      email,
      dob,
      source,
    },
  });
};

// 5. Delete Client
const deleteClient = async (clientId) => {
  return apiRequest({
    method: 'delete',
    url: `${BASE_URL}/clients/deleteclient/${clientId}`,
    data: {
      client_id: clientId,
    },
  });
};

export default {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};
