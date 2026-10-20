const BASE_URL = import.meta.env.VITE_API_URL || 'https://edugate-global-crm.vercel.app/api';

const getAllUsers = async () => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch users list');
  }

  return await response.json();
};

const getUserById = async (user_id) => {
  const response = await fetch(`${BASE_URL}/users/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to find user with ID: ${user_id}`);
  }

  return await response.json();
};

const createUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create user');
  }

  return await response.json();
};

const updateUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update user');
  }

  return await response.json();
};

const deleteUser = async (user_id) => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete user');
  }

  return await response.json();
};

const getUsersByRole = async (roleId = 'STAFF') => {
  try {
    const response = await fetch(`${BASE_URL}/users/role/${encodeURIComponent(roleId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // fallback below
  }

  // Fallback to filtering all users
  const allUsersRes = await getAllUsers();
  const rawList = Array.isArray(allUsersRes?.data) ? allUsersRes.data : Array.isArray(allUsersRes) ? allUsersRes : [];
  return {
    status: 'success',
    data: rawList.filter((u) => String(u.role_id || u.role || '').toUpperCase() === String(roleId).toUpperCase()),
  };
};

const getStaffUsers = () => getUsersByRole('STAFF');

export default {
  getAllUsers,
  getUsersByRole,
  getStaffUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
