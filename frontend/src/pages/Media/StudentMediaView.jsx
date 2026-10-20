import React, { useState, useEffect } from 'react';
import useMedia from '../../hooks/Media/useMedia';
import UploadStudentMediaModal from '../../components/Modals/Media/UploadStudentMediaModal';

import {
  UserCircle,
  Search,
  Upload,
  RefreshCw,
  Trash2,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  FileBadge,
  File,
  X,
} from 'lucide-react';

const getDocIcon = (name = '') => {
  if (name.includes('[Passport]')) return Shield;
  if (name.includes('[Certificate]')) return Award;
  if (name.includes('[O/L]')) return FileBadge;
  if (name.includes('[A/L]')) return FileBadge;
  return FileText;
};

export default function StudentMediaView() {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [activeStudentId, setActiveStudentId] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    mediaList,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    setSearchQuery,
    handleRefresh,
    goToPage,
    uploadMedia,
    deleteMedia,
    openMediaUrl,
  } = useMedia();

  // Update search query when activeStudentId changes
  useEffect(() => {
    if (activeStudentId) {
      setSearchQuery(`[STD-${activeStudentId}]`);
    } else {
      setSearchQuery('@@HIDDEN_NO_MATCH@@'); // Prevents showing general media when no student is selected
    }
  }, [activeStudentId, setSearchQuery]);

  const handleFindStudent = (e) => {
    e.preventDefault();
    if (studentIdInput.trim()) {
      setActiveStudentId(studentIdInput.trim());
      goToPage(1);
    }
  };

  const clearStudent = () => {
    setStudentIdInput('');
    setActiveStudentId('');
    setSearchQuery('@@HIDDEN_NO_MATCH@@');
  };

  return (
    <div className="space-y-4">
      {/* Student Selector Card */}
      <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 font-bold">
            <UserCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Student Profile Media Vault</h2>
            <p className="text-xs text-slate-500">Search and attach passports, transcript certificates, and offer letters</p>
          </div>
        </div>

        <form onSubmit={handleFindStudent} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-blue-500" />
            <input
              type="text"
              placeholder="Enter Student ID (e.g. 1)"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-blue-200 bg-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {activeStudentId && (
              <button
                type="button"
                onClick={clearStudent}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!studentIdInput.trim() || activeStudentId === studentIdInput.trim()}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer disabled:opacity-50"
          >
            Find
          </button>
        </form>
      </div>

      {!activeStudentId ? (
        <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Student Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Enter a student ID in the search bar above to view, attach, or manage their academic documents like passports and certificates.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs overflow-hidden">
          {/* Active Student Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                <UserCircle className="w-3 h-3 text-blue-600" />
                Student ID: #{activeStudentId}
              </span>
              <span className="text-xs text-slate-500 font-medium">{totalCount} documents attached</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Refresh Documents"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
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

          {/* Error State */}
          {error && (
            <div className="p-3 border-b bg-red-50 border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          {loading && mediaList.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-xs">Loading Student Documents...</p>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileBadge className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-sm text-slate-700">No Documents Found</p>
              <p className="text-xs mt-1 text-slate-400">This student does not have any attached documents yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Document Details</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Uploaded By</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs bg-white">
                  {mediaList.map((m) => {
                    const DocIcon = getDocIcon(m.original_name);
                    const nameParts = m.original_name.split('-');
                    const cleanName = nameParts.length > 2 ? nameParts.slice(2).join('-').trim() : m.original_name;
                    const docTypeMatch = m.original_name.match(/\[(.*?)\]/g);
                    const docType = docTypeMatch && docTypeMatch.length > 1 ? docTypeMatch[1].replace(/[\[\]]/g, '') : 'Document';

                    return (
                      <tr key={m.media_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                              <DocIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                {docType}
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-normal">
                                  {(m.file_size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={cleanName}>
                                {cleanName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${m.provider === 'google_drive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {m.provider === 'google_drive' ? 'Google Drive' : 'Supabase'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {m.uploader ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {(m.uploader.name || m.uploader.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                                  {m.uploader.name || 'User'}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                  {m.uploader.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {new Date(m.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => openMediaUrl(m.media_id, m.provider)}
                            className="p-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer"
                            title="View / Download"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMedia(m.media_id, m.provider)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} items)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-blue-200 text-slate-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-blue-200 text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-blue-200 text-slate-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Upload Modal */}
      <UploadStudentMediaModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        activeStudentId={activeStudentId}
        onUploadSuccess={handleRefresh}
      />
    </div>
  );
}
