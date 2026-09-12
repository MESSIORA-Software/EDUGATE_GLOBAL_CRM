const BASE_URL = import.meta.env.VITE_API_URL;

const login = async (email, password) => {
  const payload = JSON.stringify({ email, password });
  let response;

  try {
    // Attempt with method specified in API documentation (GET with body)
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (response.status === 404 || response.status === 405) {
      response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
    }
  } catch {
    // Browsers reject GET with body with TypeError; fallback to POST
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Login failed');
  }

  return await response.json();
};

const viewMyProfile = async (token) => {
  const authToken = token || localStorage.getItem('token');

  const response = await fetch(`${BASE_URL}/auth/viewmyprofile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch user profile');
  }

  return await response.json();
};

export default {
  login,
  viewMyProfile,
};
