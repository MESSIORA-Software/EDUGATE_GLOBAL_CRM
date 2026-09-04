const BASE_URL = 'https://edugate-global-crm.vercel.app/api';

const getAllRoles = async () => {
  const response = await fetch(`${BASE_URL}/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch system user roles');
  }

  return await response.json();
};

const getRoleById = async (role_id) => {
  const response = await fetch(`${BASE_URL}/roles/find-by-id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role_id }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to find role with ID: ${role_id}`);
  }

  return await response.json();
};

const createRole = async (role_id, role_name) => {
  const response = await fetch(`${BASE_URL}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role_id, role_name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create role');
  }

  return await response.json();
};

const updateRole = async (role_id, role_name) => {
  const response = await fetch(`${BASE_URL}/roles`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role_id, role_name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update role');
  }

  return await response.json();
};

const deleteRole = async (role_id) => {
  const response = await fetch(`${BASE_URL}/roles`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role_id }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete role');
  }

  return await response.json();
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
