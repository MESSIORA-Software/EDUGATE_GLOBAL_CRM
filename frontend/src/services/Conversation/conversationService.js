import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT_MS = 15000;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = (method, url, options = {}) => axios.request({
  method,
  url: `${BASE_URL}${url}`,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  },
  ...options,
});

const getConversations = (filters = {}) => request('get', '/conversations', { params: filters });
const getConversationDetails = (id) => request('get', `/conversations/${id}`);
const getMessages = (id) => request('get', `/conversations/${id}/messages`);
const sendMessage = (id, messageData) => request('post', `/conversations/${id}/messages`, { data: messageData });

const uploadMedia = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${BASE_URL}/conversations/media/upload`, formData, {
    timeout: REQUEST_TIMEOUT_MS,
    headers: getAuthHeaders(),
  });
};

const getWhatsAppStatus = () => request('get', '/conversations/whatsapp/status');
const connectWhatsApp = () => request('post', '/conversations/whatsapp/connect');
const disconnectWhatsApp = () => request('post', '/conversations/whatsapp/disconnect');

const getEmailStatus = () => request('get', '/conversations/email/status');
const syncEmails = () => request('post', '/conversations/email/sync');

const createOpportunityFromConversation = (id, data) => request('post', `/conversations/${id}/opportunity`, { data });
const getOpportunityStatuses = () => request('get', '/oppertunity-status/getalloppertunitystatuses');
const getUsersByRole = (roleId = 'STAFF') => request('get', `/users/role/${encodeURIComponent(roleId)}`);
const getStaffUsers = () => getUsersByRole('STAFF');

export default {
  getConversations,
  getConversationDetails,
  getMessages,
  sendMessage,
  uploadMedia,
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  getEmailStatus,
  syncEmails,
  createOpportunityFromConversation,
  getOpportunityStatuses,
  getUsersByRole,
  getStaffUsers,
};


