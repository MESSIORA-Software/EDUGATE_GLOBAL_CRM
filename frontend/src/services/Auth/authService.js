const BASE_URL = 'https://edugate-global-crm.vercel.app/api';

const login = async (serviceNo, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceNo, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed.');
  }
  return await response.json();
};

const getUserDetails = async (serviceNo) => {
  const response = await fetch(`${BASE_URL}/auth/user-details?serviceNo=${serviceNo}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user details.');
  }
  return await response.json();
};

export default {
  login,
  getUserDetails,
};
