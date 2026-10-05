const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const uploadMedia = async (file, provider = 'supabase', googleAccessToken = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (provider) formData.append('provider', provider);
  if (googleAccessToken) formData.append('google_access_token', googleAccessToken);

  const response = await fetch(`${BASE_URL}/media`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Media upload failed');
  }

  return await response.json();
};

const listMedia = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
  const query = new URLSearchParams(cleanParams).toString();

  const response = await fetch(`${BASE_URL}/media${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch media list');
  }

  return await response.json();
};

const getMediaById = async (id) => {
  const response = await fetch(`${BASE_URL}/media/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Media file not found');
  }

  return await response.json();
};

const getSignedUrl = async (id, googleAccessToken = null) => {
  const query = googleAccessToken ? `?google_access_token=${encodeURIComponent(googleAccessToken)}` : '';
  const response = await fetch(`${BASE_URL}/media/${id}/url${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate access URL');
  }

  return await response.json();
};

const deleteMedia = async (id, googleAccessToken = null) => {
  const response = await fetch(`${BASE_URL}/media/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ google_access_token: googleAccessToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete media');
  }

  return await response.json();
};

const getGoogleAuthUrl = async () => {
  const response = await fetch(`${BASE_URL}/media/google/auth`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get Google Auth URL');
  }

  return await response.json();
};

const handleGoogleCallback = async (code) => {
  const response = await fetch(`${BASE_URL}/media/google/callback?code=${code}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // No auth header needed usually for callback if it's a redirect, but we'll include it just in case
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to handle Google callback');
  }

  return await response.json();
};

export default {
  uploadMedia,
  listMedia,
  getMediaById,
  getSignedUrl,
  deleteMedia,
  getGoogleAuthUrl,
  handleGoogleCallback,
};
