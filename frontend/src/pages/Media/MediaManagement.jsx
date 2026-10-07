import React, { useState } from 'react';
import useMedia from '../../hooks/Media/useMedia';
import UploadMediaModal from '../../components/Modals/Media/UploadMediaModal';
import StudentMediaView from './StudentMediaView';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            backgroundColor: toast.type === 'error' ? COLORS.secondaryDark : COLORS.foreground,
            color: toast.type === 'error' ? COLORS.secondaryBorder : '#34D399',
          }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-bold animate-bounce"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Card */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div
            style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0"
          >
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={TYPOGRAPHY.h2}>Media Storage</h1>
              <Badge variant="blue" icon={Sparkles}>
                File Storage
              </Badge>
            </div>
            <p className={TYPOGRAPHY.subheading}>
              Manage and organize document uploads, images, and attachments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            style={{ borderColor: COLORS.border, color: COLORS.muted }}
            className="p-2 rounded-xl border hover:bg-slate-100 transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1E3A8A]' : ''}`} />
          </button>
          <Button variant="primary" icon={Upload} onClick={() => setIsUploadOpen(true)}>
            Upload Media
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold transition-colors ${
            activeTab === 'all'
              ? 'text-[#1E3A8A] bg-blue-50 border-b-2 border-[#1E3A8A]'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          All Media Files
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-bold transition-colors ${
            activeTab === 'student'
              ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Total Files</p>
            <p style={{ color: COLORS.primary }} className="text-2xl font-extrabold mt-0.5">
              {totalCount}
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <File className="w-5 h-5" />
          </div>
        </div>

        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Current Page</p>
            <p style={{ color: COLORS.success }} className="text-2xl font-extrabold mt-0.5">
              {currentPage} / {totalPages || 1}
            </p>
          </div>
          <div
            style={{ backgroundColor: COLORS.successLight, color: COLORS.success }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className={TYPOGRAPHY.label}>Storage Connect</p>
            {localStorage.getItem('google_access_token') ? (
              <p style={{ color: COLORS.secondary }} className="text-xs font-bold mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Google Drive Connected
              </p>
            ) : (
              <button 
                onClick={connectGoogleDrive}
                className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Connect Google Drive
              </button>
            )}
          </div>
          <div
            style={{ backgroundColor: COLORS.secondaryLight, color: COLORS.secondary }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
          >
            <Server className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-3.5 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center"
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search style={{ color: COLORS.placeholder }} className="w-3.5 h-3.5 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search file by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={hasActiveFilters ? 'primary' : 'outline'}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            Filters {hasActiveFilters ? `(${[mimeFilter, dateFrom, dateTo].filter(Boolean).length})` : ''}
          </Button>
        </div>
      </div>

      {/* Expandable Filter Box */}
      {showFilters && (
        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="p-4 rounded-2xl border shadow-sm flex flex-wrap gap-4 items-end"
        >
          <div className="flex flex-col gap-1">
            <label className={TYPOGRAPHY.label}>File Type</label>
            <select
              value={mimeFilter}
              onChange={(e) => setMimeFilter(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              {MIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className={TYPOGRAPHY.label}>From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={TYPOGRAPHY.label}>To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={TYPOGRAPHY.label}>Storage Provider</label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="">All Providers</option>
              <option value="supabase">Supabase</option>
              <option value="google_drive">Google Drive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className={TYPOGRAPHY.label}>Uploader ID</label>
            <input
              type="number"
              placeholder="User ID (Admin)"
              value={uploadedByFilter}
              onChange={(e) => setUploadedByFilter(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="px-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] w-32"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              icon={X}
              onClick={() => {
                setMimeFilter('');
                setDateFrom('');
                setDateTo('');
                setProviderFilter('');
                setUploadedByFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Table Container */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl border shadow-sm overflow-hidden"
      >
        {error && (
          <div
            style={{ backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondaryBorder, color: COLORS.secondary }}
            className="p-3 border-b text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && mediaList.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.muted }}>
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
            <p className="font-semibold text-xs">Loading Media Files...</p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-8 text-center" style={{ color: COLORS.placeholder }}>
            <HardDrive className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm" style={{ color: COLORS.foreground }}>No Media Files Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
                  className="border-b text-[11px] font-bold uppercase tracking-wider text-slate-500"
                >
                  <th className="py-3 px-4">File</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {mediaList.map((m) => {
                  const Icon = getFileIcon(m.mime_type);
                  return (
                    <tr key={m.media_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold max-w-[220px] truncate" style={{ color: COLORS.foreground }} title={m.original_name}>
                              {m.original_name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {String(m.media_id).substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold border border-slate-200">
                          {m.mime_type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${m.provider === 'google_drive' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {m.provider === 'google_drive' ? 'Google Drive' : 'Supabase'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {(m.file_size / 1024 / 1024).toFixed(2)} MB
                      </td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {new Date(m.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => openMediaUrl(m.media_id, m.provider)}
                          style={{ color: COLORS.muted, borderColor: COLORS.border }}
                          className="p-1.5 rounded-lg border hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors"
                          title="View / Download"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMedia(m.media_id, m.provider)}
                          style={{ color: COLORS.muted, borderColor: COLORS.border }}
                          className="p-1.5 rounded-lg border hover:text-red-600 hover:bg-red-50 transition-colors"
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
          <div
            style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
            className="flex items-center justify-between px-4 py-3 border-t"
          >
            <p className="text-xs text-slate-500 font-medium">
              Page <span className="font-bold text-slate-700">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-700">{totalPages}</span> ({totalCount} items)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                      page === currentPage
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
