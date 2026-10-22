import { useState, useCallback } from 'react';
import studentDocumentService from '../../services/Media/studentDocumentService';

const PAGE_LIMIT = 20;

export default function useStudentDocuments() {
  // Student search
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [studentsTotalCount, setStudentsTotalCount] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const studentsTotalPages = Math.ceil(studentsTotalCount / PAGE_LIMIT);

  // Active student folder
  const [activeStudent, setActiveStudent] = useState(null); // { client_id, name, email, document_count }

  // Document list for active student
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState(null);
  const [docsTotalCount, setDocsTotalCount] = useState(0);
  const [docsPage, setDocsPage] = useState(1);
  const docsTotalPages = Math.ceil(docsTotalCount / PAGE_LIMIT);
  const [docsSearch, setDocsSearch] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Student search ──────────────────────────────────────────────────────────

  const searchStudents = useCallback(async ({ clientId, name, page = 1 } = {}) => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const res = await studentDocumentService.searchStudents({
        ...(clientId ? { clientId } : {}),
        ...(name     ? { name }     : {}),
        page,
        limit: PAGE_LIMIT,
      });
      setStudents(res.data ?? []);
      setStudentsTotalCount(res.total ?? 0);
      setStudentsPage(res.page ?? page);
    } catch (err) {
      setStudentsError(err.message || 'Search failed');
      showToast(err.message || 'Search failed', 'error');
    } finally {
      setStudentsLoading(false);
    }
  }, [showToast]);

  const openStudentFolder = useCallback((student) => {
    setActiveStudent(student);
    setDocuments([]);
    setDocsPage(1);
    setDocsSearch('');
    setDocsError(null);
  }, []);

  const closeStudentFolder = useCallback(() => {
    setActiveStudent(null);
    setDocuments([]);
    setDocsPage(1);
    setDocsSearch('');
    setDocsError(null);
  }, []);

  // ── Document list ───────────────────────────────────────────────────────────

  const fetchDocuments = useCallback(async (clientId, page = 1, search = '') => {
    setDocsLoading(true);
    setDocsError(null);
    try {
      const res = await studentDocumentService.listDocuments(clientId, {
        page,
        limit: PAGE_LIMIT,
        ...(search ? { search } : {}),
      });
      setDocuments(res.data ?? []);
      setDocsTotalCount(res.total ?? 0);
      setDocsPage(res.page ?? page);
    } catch (err) {
      setDocsError(err.message || 'Failed to load documents');
      showToast(err.message || 'Failed to load documents', 'error');
    } finally {
      setDocsLoading(false);
    }
  }, [showToast]);

  const refreshDocuments = useCallback(() => {
    if (activeStudent) {
      fetchDocuments(activeStudent.client_id, docsPage, docsSearch);
    }
  }, [activeStudent, docsPage, docsSearch, fetchDocuments]);

  const goToDocsPage = useCallback((page) => {
    if (page >= 1 && page <= docsTotalPages && activeStudent) {
      setDocsPage(page);
      fetchDocuments(activeStudent.client_id, page, docsSearch);
    }
  }, [docsTotalPages, activeStudent, docsSearch, fetchDocuments]);

  // ── Upload ──────────────────────────────────────────────────────────────────

  const uploadDocument = useCallback(async (clientId, file, documentName, description) => {
    try {
      await studentDocumentService.uploadDocument(clientId, file, documentName, description);
      showToast('Document uploaded successfully');
      // Refresh document list and update student's doc count
      await fetchDocuments(clientId, 1, docsSearch);
      setDocsPage(1);
      // Update active student's document_count
      setActiveStudent(prev => prev ? { ...prev, document_count: (prev.document_count || 0) + 1 } : prev);
      return true;
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
      return false;
    }
  }, [showToast, fetchDocuments, docsSearch]);

  // ── View/Download ───────────────────────────────────────────────────────────

  const openDocumentUrl = useCallback(async (docId) => {
    try {
      const res = await studentDocumentService.getSignedUrl(docId);
      if (res?.data?.url) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err) {
      showToast(err.message || 'Failed to open document', 'error');
    }
  }, [showToast]);

  // ── Rename ──────────────────────────────────────────────────────────────────

  const renameDocument = useCallback(async (docId, documentName, description) => {
    try {
      await studentDocumentService.renameDocument(docId, documentName, description);
      showToast('Document renamed successfully');
      if (activeStudent) {
        fetchDocuments(activeStudent.client_id, docsPage, docsSearch);
      }
      return true;
    } catch (err) {
      showToast(err.message || 'Rename failed', 'error');
      return false;
    }
  }, [showToast, activeStudent, docsPage, docsSearch, fetchDocuments]);

  // ── Delete ──────────────────────────────────────────────────────────────────

  const deleteDocument = useCallback(async (docId) => {
    if (!window.confirm('Are you sure you want to permanently delete this document?')) return;
    try {
      await studentDocumentService.deleteDocument(docId);
      showToast('Document deleted successfully');
      if (activeStudent) {
        const newTotal = Math.max(0, docsTotalCount - 1);
        const newTotalPages = Math.ceil(newTotal / PAGE_LIMIT);
        const targetPage = documents.length === 1 && docsPage > 1
          ? docsPage - 1
          : Math.min(docsPage, newTotalPages || 1);
        setActiveStudent(prev => prev ? { ...prev, document_count: Math.max(0, (prev.document_count || 1) - 1) } : prev);
        fetchDocuments(activeStudent.client_id, targetPage, docsSearch);
        setDocsPage(targetPage);
      }
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  }, [showToast, activeStudent, docsTotalCount, documents.length, docsPage, docsSearch, fetchDocuments]);

  return {
    // Student search
    students,
    studentsLoading,
    studentsError,
    studentsTotalCount,
    studentsPage,
    studentsTotalPages,
    searchStudents,

    // Active student
    activeStudent,
    openStudentFolder,
    closeStudentFolder,

    // Documents
    documents,
    docsLoading,
    docsError,
    docsTotalCount,
    docsPage,
    docsTotalPages,
    docsSearch,
    setDocsSearch,
    fetchDocuments,
    refreshDocuments,
    goToDocsPage,

    // Actions
    uploadDocument,
    openDocumentUrl,
    renameDocument,
    deleteDocument,

    // Toast
    toast,
    showToast,
  };
}
