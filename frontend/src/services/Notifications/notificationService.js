const BASE_URL = import.meta.env.VITE_API_URL || 'https://edugate-global-crm.vercel.app/api';

const getHeaders = (token) => {
  const authToken = token || localStorage.getItem('token') || localStorage.getItem('jwt');
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};

const getUnreadCount = async (token) => {
  const response = await fetch(`${BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch unread count');
  }
  return await response.json();
};


const getNotifications = async (token, params = {}) => {
  const query = new URLSearchParams();

  if (params.limit !== undefined && params.limit !== null) {
    query.set('limit', String(params.limit));
  }
  if (params.read === true || params.read === 'true') {
    query.set('read', 'true');
  } else if (params.read === false || params.read === 'false') {
    query.set('read', 'false');
  }
  if (params.type && params.type !== 'ALL' && params.type !== 'all') {
    query.set('type', String(params.type));
  }
  if (params.cursor) {
    query.set('cursor', String(params.cursor));
  }

  const queryString = query.toString();
  const url = `${BASE_URL}/notifications${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch notifications');
  }
  return await response.json();
};

const markAsRead = async (token, notificationId) => {
  const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to mark notification as read');
  }
  return await response.json();
};

const markAllAsRead = async (token) => {
  const response = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to mark all notifications as read');
  }
  return await response.json();
};

export default {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
