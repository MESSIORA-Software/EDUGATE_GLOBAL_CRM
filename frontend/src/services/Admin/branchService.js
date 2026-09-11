import axios from 'axios';

const BASE_URL = 'https://edugate-global-crm.vercel.app/api';

const REQUEST_TIMEOUT_MS = 15000;

// Create Branch
const createBranch = async (name, address, phone) => {
  const config = {
    method: 'post',
    url: `${BASE_URL}/branches/createbranch`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      name: name,
      address: address,
      phone: phone,
    },
  };

  return axios.request(config).then((response) => {
    return response;
  });
};


// Fetch All Branches
const getBranches = async () => {
  const config = {
    method: 'get',
    url: `${BASE_URL}/branches/allbranches`,
    timeout: REQUEST_TIMEOUT_MS,
  };

  return axios.request(config).then((response) => {
    return response;
  });
};


// Find Branch by ID
const getBranchById = async (branchId) => {
  const config = {
    method: 'get',
    url: `${BASE_URL}/branches/branch/${branchId}`,
    timeout: REQUEST_TIMEOUT_MS,
  };

  return axios.request(config).then((response) => {
    return response;
  });
};


// Update Branch
const updateBranch = async (branchId, name, address, phone) => {
  const config = {
    method: 'post',
    url: `${BASE_URL}/branches/updatebranch`,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      branch_id: branchId,
      name: name,
      address: address,
      phone: phone,
    },
  };

  return axios.request(config).then((response) => {
    return response;
  });
};


// Delete Branch
const deleteBranch = async (branchId) => {
  const config = {
    method: 'delete',
    url: `${BASE_URL}/branches/deletebranch/${branchId}`,
    timeout: REQUEST_TIMEOUT_MS,
  };

  return axios.request(config).then((response) => {
    return response;
  });
};


// Fetch Users According to Branch
const getUsersByBranch = async (branchId) => {
  const config = {
    method: 'get',
    url: `${BASE_URL}/users/branch`,
    timeout: REQUEST_TIMEOUT_MS,
    params: {
      branch_id: branchId,
    },
  };

  return axios.request(config).then((response) => {
    return response;
  });
};


export default {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  getUsersByBranch,
};