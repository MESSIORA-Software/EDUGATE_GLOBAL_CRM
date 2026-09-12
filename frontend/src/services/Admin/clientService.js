import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://edugate-global-crm.vercel.app/api';

const REQUEST_TIMEOUT_MS = 15000;

// 1. Create Client
const createClient = async (name, email, dob, source) => {
  const config = {
    method: 'post',
    url: `${BASE_URL}/clients/createclient`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      name,
      email,
      dob,
      source,
    },
  };

  return axios.request(config);
};

// 2. Find all clients
const getAllClients = async () => {
  const config = {
    method: 'get',
    url: `${BASE_URL}/clients/getallclients`,
    timeout: REQUEST_TIMEOUT_MS,
  };

  return axios.request(config);
};

// 3. Find Clients by ID
const getClientById = async (clientId) => {
  const config = {
    method: 'get',
    url: `${BASE_URL}/clients/getclientbyid/${clientId}`,
    timeout: REQUEST_TIMEOUT_MS,
    params: {
      client_id: clientId,
    },
  };

  return axios.request(config);
};

// 4. Update Client
const updateClient = async (clientId, name, email, dob, source) => {
  const config = {
    method: 'put',
    url: `${BASE_URL}/clients/updateclient`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      client_id: clientId,
      name,
      email,
      dob,
      source,
    },
  };

  return axios.request(config);
};

// 5. Delete Client
const deleteClient = async (clientId) => {
  const config = {
    method: 'delete',
    url: `${BASE_URL}/clients/deleteclient/${clientId}`,
    timeout: REQUEST_TIMEOUT_MS,
    data: {
      client_id: clientId,
    },
  };

  return axios.request(config);
};

export default {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};
