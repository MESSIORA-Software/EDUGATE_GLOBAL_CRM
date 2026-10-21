import React, { useState } from 'react';
import useMedia from '../../hooks/Media/useMedia';
import UploadMediaModal from '../../components/Modals/Media/UploadMediaModal';
import StudentMediaView from './StudentMediaView';
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
  Cloud,
} from 'lucide-react';

const formatMediaId = (id) => {
  if (id === null || id === undefined) return '';
  const num = Number(id);
  if (!isNaN(num) && Number.isInteger(num)) {
    return `MED-${String(num).padStart(4, '0')}`;
  }
  return `MED-${String(id).substring(0, 6).toUpperCase()}`;
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getMimeBadgeDetails = (mimeType = '') => {
  const mime = (mimeType || '').toLowerCase();
  if (mime === 'application/pdf') {
    return { label: 'PDF', bg: 'bg-rose-50 text-rose-700 border-rose-200/70', iconColor: 'text-rose-600 bg-rose-50 border-rose-200/60' };
  }
  if (mime.includes('image/png')) {
    return { label: 'PNG', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' };
  }
  if (mime.includes('image/jpeg') || mime.includes('image/jpg')) {
    return { label: 'JPG', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' };
  }
  if (mime.includes('image/webp')) {
    return { label: 'WEBP', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' };
  }
  if (mime.startsWith('image/')) {
    return { label: 'IMG', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' };
  }
  if (mime.includes('word') || mime.includes('officedocument.wordprocessingml')) {
    return { label: 'DOCX', bg: 'bg-blue-50 text-blue-700 border-blue-200/70', iconColor: 'text-blue-600 bg-blue-50 border-blue-200/60' };
  }
  if (mime.includes('spreadsheet') || mime.includes('excel')) {
    return { label: 'XLSX', bg: 'bg-teal-50 text-teal-700 border-teal-200/70', iconColor: 'text-teal-600 bg-teal-50 border-teal-200/60' };
  }
  if (mime.startsWith('video/')) {
    return { label: 'VIDEO', bg: 'bg-purple-50 text-purple-700 border-purple-200/70', iconColor: 'text-purple-600 bg-purple-50 border-purple-200/60' };
  }
  if (mime.startsWith('audio/')) {
    return { label: 'AUDIO', bg: 'bg-amber-50 text-amber-700 border-amber-200/70', iconColor: 'text-amber-600 bg-amber-50 border-amber-200/60' };
  }
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('compressed')) {
    return { label: 'ZIP', bg: 'bg-orange-50 text-orange-700 border-orange-200/70', iconColor: 'text-orange-600 bg-orange-50 border-orange-200/60' };
  }
  return { label: 'FILE', bg: 'bg-slate-100 text-slate-700 border-slate-200/70', iconColor: 'text-slate-600 bg-slate-100 border-slate-200/60' };
};

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
  { label: 'Word (DOCX)', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'Excel (XLSX)', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { label: 'Videos', value: 'video/mp4' },
  { label: 'Audio', value: 'audio/mpeg' },
  { label: 'ZIP Archives', value: 'application/zip' },
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

  const hasActiveFilters = Boolean(mimeFilter || dateFrom || dateTo || providerFilter || uploadedByFilter);

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

        {/* Toolbar Controls */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          {/* Google Drive Status / Connect Button */}
          {localStorage.getItem('google_access_token') ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-800 text-xs font-semibold shadow-2xs">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Drive Connected
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectGoogleDrive}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
              title="Connect your Google Drive account"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
              <span>Connect Google Drive</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh Files"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>

          {/* Upload Button */}
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
          {/* Search & Filter Toolbar */}
          <div
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
            className="p-3.5 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center"
          >
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search file by name or extension..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
                  className="w-full pl-10 pr-9 py-2 border rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs cursor-pointer ${
                  hasActiveFilters || showFilters
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white leading-tight">
                    {[mimeFilter, dateFrom, dateTo, providerFilter, uploadedByFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Right side status / counter */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-[11px] text-slate-600 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Showing <strong className="text-slate-800">{mediaList.length}</strong> of{' '}
                <strong className="text-slate-800">{totalCount}</strong> files
              </span>
            </div>
          </div>

          {/* Expandable Filter Box */}
          {showFilters && (
            <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-wrap gap-4 items-end animate-in fade-in duration-150">
              <div className="flex flex-col gap-1">
                <label className={TYPOGRAPHY.label}>File Type</label>
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
                <label className={TYPOGRAPHY.label}>From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={TYPOGRAPHY.label}>To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={TYPOGRAPHY.label}>Storage Provider</label>
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
                <label className={TYPOGRAPHY.label}>Uploader ID</label>
                <input
                  type="number"
                  placeholder="User ID (Admin)"
                  value={uploadedByFilter}
                  onChange={(e) => setUploadedByFilter(e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 w-32"
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
              <div className="p-8 text-center" style={{ color: COLORS.muted }}>
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
                <p className="font-semibold text-xs">Loading Media Files...</p>
              </div>
            ) : mediaList.length === 0 ? (
              <div className="p-8 text-center" style={{ color: COLORS.placeholder }}>
                <HardDrive className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-sm" style={{ color: COLORS.foreground }}>No Media Files Found</p>
                <p className="text-xs text-slate-400 mt-1">Upload a file or try adjusting your search filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
                      className="border-b text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
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
                      const badgeInfo = getMimeBadgeDetails(m.mime_type);
                      return (
                        <tr key={m.media_id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* File Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badgeInfo.iconColor} shadow-2xs`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-xs truncate max-w-[220px] group-hover:text-blue-600 transition-colors" title={m.original_name}>
                                  {m.original_name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                                    {formatMediaId(m.media_id)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* MIME Type Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono tracking-wide border shadow-2xs ${badgeInfo.bg}`}>
                              {badgeInfo.label}
                            </span>
                          </td>

                          {/* Storage Provider */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                              m.provider === 'google_drive'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {m.provider === 'google_drive' ? (
                                <>
                                  <Cloud className="w-3 h-3 text-emerald-600" />
                                  Drive
                                </>
                              ) : (
                                <>
                                  <Server className="w-3 h-3 text-slate-500" />
                                  Supabase
                                </>
                              )}
                            </span>
                          </td>

                          {/* File Size */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-xs">
                            {formatFileSize(m.file_size)}
                          </td>

                          {/* Uploader */}
                          <td className="py-3.5 px-4">
                            {m.uploader ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 border border-blue-200/60">
                                  {(m.uploader.name || m.uploader.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate max-w-[130px]">
                                    {m.uploader.name || 'User'}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                    {m.uploader.email}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono text-xs">—</span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap font-medium">
                            {new Date(m.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openMediaUrl(m.media_id, m.provider)}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all shadow-xs cursor-pointer"
                                title="View / Download"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteMedia(m.media_id, m.provider)}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-all shadow-xs cursor-pointer"
                                title="Delete File"
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
