import React, { useState, useEffect } from 'react';
import useStudentDocuments from '../../hooks/Media/useStudentDocuments';
import UploadStudentDocumentModal from '../../components/Modals/Media/UploadStudentDocumentModal';
import RenameDocumentModal from '../../components/Modals/Media/RenameDocumentModal';

import {
  UserCircle,
  Search,
  Upload,
  RefreshCw,
  Trash2,
  ExternalLink,
  FileText,
  File,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  FileBadge,
  Pencil,
  X,
  CheckCircle2,
} from 'lucide-react';
import { COLORS } from '../../constants/colors';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return File;
  if (mimeType === 'application/pdf') return FileText;
  return File;
};

export default function StudentMediaView() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [docSearchInput, setDocSearchInput] = useState('');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  const {
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
    fetchDocuments,
    refreshDocuments,
    goToDocsPage,

    // Actions
    uploadDocument,
    openDocumentUrl,
    renameDocument,
    deleteDocument,

    toast,
  } = useStudentDocuments();

  // Load initial accessible students on mount so folders are visible immediately
  useEffect(() => {
    searchStudents({ page: 1 });
  }, [searchStudents]);

  // When a student folder is opened, load their documents
  useEffect(() => {
    if (activeStudent) {
      fetchDocuments(activeStudent.client_id, 1, '');
    }
  }, [activeStudent]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e?.preventDefault();
    const raw = searchInput.trim();
    setSearchTerm(raw);
    if (!raw) {
      searchStudents({ page: 1 });
      return;
    }

    // Extract digits if input is "1", "#1", "STD-1", "std 1", "Client 1", etc.
    const digitsOnly = raw.replace(/^(std|student|client|cl)?[\s-#_]*/i, '').trim();
    const isNumeric = /^\d+$/.test(digitsOnly);

    if (isNumeric) {
      searchStudents({ clientId: parseInt(digitsOnly, 10), name: raw, page: 1 });
    } else {
      searchStudents({ name: raw, page: 1 });
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    searchStudents({ page: 1 });
  };

  const handleStudentPageChange = (targetPage) => {
    const raw = searchInput.trim();
    const digitsOnly = raw.replace(/^(std|student|client|cl)?[\s-#_]*/i, '').trim();
    const isNumeric = /^\d+$/.test(digitsOnly);
    if (isNumeric) {
      searchStudents({ clientId: parseInt(digitsOnly, 10), name: raw, page: targetPage });
    } else {
      searchStudents({ name: raw || undefined, page: targetPage });
    }
  };

  const handleDocSearch = (e) => {
    e.preventDefault();
    if (activeStudent) {
      fetchDocuments(activeStudent.client_id, 1, docSearchInput.trim());
    }
  };

  const handleClearDocSearch = () => {
    setDocSearchInput('');
    if (activeStudent) {
      fetchDocuments(activeStudent.client_id, 1, '');
    }
  };

  const handleOpenFolder = (student) => {
    openStudentFolder(student);
    setDocSearchInput('');
  };

  const handleCloseFolder = () => {
    closeStudentFolder();
    setDocSearchInput('');
  };

  // ── If a student folder is open, show document list view ──────────────────

  if (activeStudent) {
    return (
      <div className="space-y-3">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Breadcrumb / Back button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCloseFolder}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Student Documents</span>
          </button>
          <span className="text-slate-400 text-xs">/</span>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            {activeStudent.name}
          </span>
        </div>

        {/* Folder Header + Actions */}
        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{activeStudent.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <UserCircle className="w-3 h-3" />
                  ID #{activeStudent.client_id}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {docsTotalCount} document{docsTotalCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={refreshDocuments}
              className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shadow-2xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${docsLoading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Add Document</span>
            </button>
          </div>
        </div>

        {/* Document search within folder */}
        <form onSubmit={handleDocSearch} className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search documents by name…"
              value={docSearchInput}
              onChange={(e) => setDocSearchInput(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-blue-200/80 bg-white rounded-xl text-xs text-slate-700 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xs"
            />
            {docSearchInput && (
              <button
                type="button"
                onClick={handleClearDocSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl border border-blue-200 bg-white text-blue-700 text-xs font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Document table */}
        <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs overflow-hidden">
          {docsError && (
            <div className="p-3 border-b bg-red-50 border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{docsError}</span>
            </div>
          )}

          {docsLoading && documents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-xs">Loading Documents…</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <FileBadge className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-bold text-sm text-slate-700">No Documents Found</p>
              <p className="text-xs mt-1 text-slate-400">
                {docSearchInput
                  ? 'No documents match your search.'
                  : 'This student has no documents yet. Click "Add Document" to upload one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Document</th>
                    <th className="py-3.5 px-4">Original File</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-4">Uploaded By</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs bg-white">
                  {documents.map((doc) => {
                    const DocIcon = getFileIcon(doc.media?.mime_type);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Document name + description */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                              <DocIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate max-w-[200px] group-hover:text-blue-700 transition-colors" title={doc.document_name}>
                                {doc.document_name}
                              </p>
                              {doc.description && (
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={doc.description}>
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Original filename */}
                        <td className="py-3.5 px-4">
                          <p className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]" title={doc.media?.original_name}>
                            {doc.media?.original_name || '—'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                            {doc.media?.mime_type?.split('/').pop() || ''}
                          </p>
                        </td>

                        {/* File size */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 text-xs whitespace-nowrap">
                          {doc.media?.file_size ? formatFileSize(doc.media.file_size) : '—'}
                        </td>

                        {/* Uploader */}
                        <td className="py-3.5 px-4">
                          {doc.uploader ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 border border-blue-200/60">
                                {(doc.uploader.name || doc.uploader.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate max-w-[110px]">
                                  {doc.uploader.name || 'User'}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                                  {doc.uploader.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap font-medium">
                          {new Date(doc.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openDocumentUrl(doc.id)}
                              className="p-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer"
                              title="View / Download"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRenameTarget(doc)}
                              className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-colors cursor-pointer"
                              title="Rename"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {docsTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{docsPage}</span> of{' '}
                <span className="font-bold text-slate-700">{docsTotalPages}</span> ({docsTotalCount} documents)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToDocsPage(docsPage - 1)}
                  disabled={docsPage === 1}
                  className="p-1.5 rounded-lg border border-blue-200 text-slate-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, docsTotalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(docsPage - 2, docsTotalPages - 4)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => goToDocsPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        page === docsPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-blue-200 text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToDocsPage(docsPage + 1)}
                  disabled={docsPage === docsTotalPages}
                  className="p-1.5 rounded-lg border border-blue-200 text-slate-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload modal */}
        <UploadStudentDocumentModal
          isOpen={isUploadOpen}
          student={activeStudent}
          onClose={() => setIsUploadOpen(false)}
          onUpload={uploadDocument}
        />

        {/* Rename modal */}
        <RenameDocumentModal
          isOpen={!!renameTarget}
          document={renameTarget}
          onClose={() => setRenameTarget(null)}
          onRename={renameDocument}
        />
      </div>
    );
  }

  // ── Student search / folder list view ─────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Search toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleSearch} className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Student ID (e.g. 1 or STD-1) or Name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-blue-200/80 bg-white rounded-xl text-xs text-slate-700 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl border border-blue-300 bg-blue-50/60 text-blue-800 text-xs font-semibold hover:bg-blue-100 hover:border-blue-500 transition-all cursor-pointer shadow-xs"
          >
            Search Students
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer"
            >
              Show All
            </button>
          )}
        </form>
      </div>

      {/* Error banner */}
      {studentsError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{studentsError}</span>
        </div>
      )}

      {/* Student grid */}
      {studentsLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="font-semibold text-xs">Loading Students…</p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
          <UserCircle className="w-12 h-12 mb-3 text-slate-300" />
          <p className="font-bold text-sm text-slate-700">
            {searchTerm ? 'No Students Found' : 'No Students Available'}
          </p>
          <p className="text-xs mt-1 text-slate-400">
            {searchTerm
              ? `No student found matching "${searchTerm}". Try entering a student ID number (e.g. 1) or full name.`
              : 'There are currently no accessible student records.'}
          </p>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="mt-3 px-3.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Clear Search and Show All
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {students.map((student) => (
              <button
                key={student.client_id}
                onClick={() => handleOpenFolder(student)}
                className="group text-left bg-white border border-blue-200/80 rounded-2xl p-4 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Folder className="w-5 h-5 text-blue-500 group-hover:hidden" />
                    <FolderOpen className="w-5 h-5 text-blue-600 hidden group-hover:block" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                      {student.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID #{student.client_id}</p>
                    {student.email && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{student.email}</p>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <FileBadge className="w-3 h-3" />
                        {student.document_count ?? 0} doc{student.document_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Student list pagination */}
          {studentsTotalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{studentsPage}</span> of{' '}
                <span className="font-bold text-slate-700">{studentsTotalPages}</span> ({studentsTotalCount} students)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStudentPageChange(studentsPage - 1)}
                  disabled={studentsPage === 1}
                  className="p-1.5 rounded-lg border border-blue-200 text-slate-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStudentPageChange(studentsPage + 1)}
                  disabled={studentsPage === studentsTotalPages}
                  className="p-1.5 rounded-lg border border-blue-200 text-slate-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
