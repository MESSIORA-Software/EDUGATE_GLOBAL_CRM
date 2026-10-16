import React, { useState } from 'react';
import useMedia from '../../hooks/Media/useMedia';
import UploadMediaModal from '../../components/Modals/Media/UploadMediaModal';
import StudentMediaView from './StudentMediaView';

import {
  HardDrive,
  Upload,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Sparkles,
  Server,
  UserCircle,
} from 'lucide-react';

const getFileIcon = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType === 'application/pdf') return FileText;
  return File;
};

const MIME_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Images', value: 'image/' },
  { label: 'PDFs', value: 'application/pdf' },
  { label: 'Word', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'Excel', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { label: 'Videos', value: 'video/mp4' },
  { label: 'Audio', value: 'audio/mpeg' },
  { label: 'ZIP', value: 'application/zip' },
];

export default function MediaManagement() {
  const {
    mediaList,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    mimeFilter,
    setMimeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    providerFilter,
    setProviderFilter,
    uploadedByFilter,
    setUploadedByFilter,
    toast,
    handleRefresh,
    goToPage,
    uploadMedia,
    deleteMedia,
    openMediaUrl,
    connectGoogleDrive,
  } = useMedia();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'student'

  const hasActiveFilters = mimeFilter || dateFrom || dateTo || providerFilter || uploadedByFilter;

  return (
    <div className="space-y-4 max-w-full mx-auto">
      {/* Toast Alert */}
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

      {/* Clean Corporate Page Header */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Media & Storage Vault
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount} Total Files
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage student application attachments, transcripts, passports, and system media.
          </p>
        </div>

        {/* Toolbar Controls (Aligned to Right Side) */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Files"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>

          {/* Upload Button (Blue Theme Border) */}
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'text-blue-900 bg-blue-50/60 border-b-2 border-blue-600'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          All Media Files
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'student'
              ? 'text-blue-900 bg-blue-50/60 border-b-2 border-blue-600'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <UserCircle className="w-4 h-4" />
          Student Documents
        </button>
      </div>

      {activeTab === 'student' ? (
        <StudentMediaView />
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Files</p>
                <p className="text-2xl font-extrabold text-blue-900 mt-0.5">
                  {totalCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                <File className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs hover:border-blue-500 transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current Page</p>
                <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                  {currentPage} / {totalPages || 1}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-red-200/80 shadow-2xs hover:border-red-500 transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cloud Storage</p>
                {localStorage.getItem('google_access_token') ? (
                  <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Google Drive Connected
                  </p>
                ) : (
                  <button
                    onClick={connectGoogleDrive}
                    className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    Connect Google Drive
                  </button>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-3.5 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search file by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  hasActiveFilters
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-blue-200 bg-white text-slate-700 hover:border-blue-400'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters {hasActiveFilters ? `(${[mimeFilter, dateFrom, dateTo].filter(Boolean).length})` : ''}</span>
              </button>
            </div>
          </div>

          {/* Expandable Filter Box */}
          {showFilters && (
            <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-wrap gap-4 items-end animate-in fade-in duration-150">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">File Type</label>
                <select
                  value={mimeFilter}
                  onChange={(e) => setMimeFilter(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  {MIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Storage Provider</label>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="">All Providers</option>
                  <option value="supabase">Supabase</option>
                  <option value="google_drive">Google Drive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Uploader ID</label>
                <input
                  type="number"
                  placeholder="User ID"
                  value={uploadedByFilter}
                  onChange={(e) => setUploadedByFilter(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 w-28"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setMimeFilter('');
                    setDateFrom('');
                    setDateTo('');
                    setProviderFilter('');
                    setUploadedByFilter('');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs overflow-hidden">
            {error && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {loading && mediaList.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="font-semibold text-xs">Loading Media Files...</p>
              </div>
            ) : mediaList.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <HardDrive className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-sm text-slate-700">No Media Files Found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">File</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Provider</th>
                      <th className="py-3.5 px-4">Size</th>
                      <th className="py-3.5 px-4">Uploaded By</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {mediaList.map((m) => {
                      const Icon = getFileIcon(m.mime_type);
                      return (
                        <tr key={m.media_id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold max-w-[220px] truncate text-slate-800" title={m.original_name}>
                                  {m.original_name}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400">
                                  #{String(m.media_id).substring(0, 8)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-mono font-bold border border-blue-200">
                              {m.mime_type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${m.provider === 'google_drive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {m.provider === 'google_drive' ? 'Google Drive' : 'Supabase'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                            {(m.file_size / 1024 / 1024).toFixed(2)} MB
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
        </>
      )}

      {/* Upload Modal */}
      <UploadMediaModal
        isOpen={isUploadOpen}
        isStudentMode={activeTab === 'student'}
        onClose={() => setIsUploadOpen(false)}
        onUpload={uploadMedia}
      />
    </div>
  );
}
