import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: `${BASE_URL}/student-journey`,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(),
  };
  return config;
});

export const studentJourneyService = {
  // Column definitions
  async getColumns() {
    const res = await api.get('/columns');
    return res.data?.data || [];
  },

  async getArchivedColumns() {
    const res = await api.get('/columns/archived');
    return res.data?.data || [];
  },

  async createColumn(payload) {
    const res = await api.post('/columns', payload);
    return res.data?.data;
  },

  async updateColumn(columnId, payload) {
    const res = await api.patch(`/columns/${columnId}`, payload);
    return res.data?.data;
  },

  async archiveColumn(columnId) {
    const res = await api.post(`/columns/${columnId}/archive`);
    return res.data?.data;
  },

  async restoreColumn(columnId) {
    const res = await api.post(`/columns/${columnId}/restore`);
    return res.data?.data;
  },

  async reorderColumns(orderedColumnIds) {
    const res = await api.post('/columns/reorder', { orderedColumnIds });
    return res.data;
  },

  // Records and tracking values
  async getRecords(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    );
    const res = await api.get('/records', { params: cleanParams });
    return res.data?.data || { records: [], total: 0, page: 1, limit: 25, totalPages: 1 };
  },

  async getStudentJourney(clientId) {
    const res = await api.get(`/records/${clientId}`);
    return res.data?.data;
  },

  async initStudentJourney(clientId) {
    const res = await api.post(`/records/${clientId}/init`);
    return res.data?.data;
  },

  async updateStudentValues(clientId, values) {
    const res = await api.patch(`/records/${clientId}/values`, { values });
    return res.data?.data;
  },

  // Export to Excel file
  async exportExcel(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    );
    const res = await api.get('/export', {
      params: cleanParams,
      responseType: 'blob',
    });

    // Create a blob URL and trigger download
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `Student_Journey_${dateStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

export default studentJourneyService;
