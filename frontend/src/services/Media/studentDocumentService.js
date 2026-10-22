const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Search for accessible students.
 * @param {{ clientId?: string|number, name?: string, page?: number, limit?: number }} params
 */
const searchStudents = async (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
  const query = new URLSearchParams(clean).toString();
  const response = await fetch(`${BASE_URL}/student-documents/students${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to search students');
  }
  return await response.json();
};

/**
 * Upload a document for a student.
 * @param {number} clientId
 * @param {File} file
 * @param {string} documentName  - Staff-provided display name
 * @param {string} [description]
 */
const uploadDocument = async (clientId, file, documentName, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_name', documentName);
  if (description) formData.append('description', description);

  const response = await fetch(`${BASE_URL}/student-documents/${clientId}/documents`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Document upload failed');
  }
  return await response.json();
};

/**
 * List documents for a student.
 * @param {number} clientId
 * @param {{ page?: number, limit?: number, search?: string }} params
 */
const listDocuments = async (clientId, params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
  const query = new URLSearchParams(clean).toString();
  const response = await fetch(`${BASE_URL}/student-documents/${clientId}/documents${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch documents');
  }
  return await response.json();
};

/**
 * Get a signed URL for a document.
 * @param {number} docId
 */
const getSignedUrl = async (docId) => {
  const response = await fetch(`${BASE_URL}/student-documents/doc/${docId}/url`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to generate access URL');
  }
  return await response.json();
};

/**
 * Rename a document (metadata only).
 * @param {number} docId
 * @param {string} documentName
 * @param {string} [description]
 */
const renameDocument = async (docId, documentName, description) => {
  const response = await fetch(`${BASE_URL}/student-documents/doc/${docId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ document_name: documentName, description }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to rename document');
  }
  return await response.json();
};

/**
 * Delete a document (association + media + storage).
 * @param {number} docId
 */
const deleteDocument = async (docId) => {
  const response = await fetch(`${BASE_URL}/student-documents/doc/${docId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete document');
  }
  return await response.json();
};

export default {
  searchStudents,
  uploadDocument,
  listDocuments,
  getSignedUrl,
  renameDocument,
  deleteDocument,
};
