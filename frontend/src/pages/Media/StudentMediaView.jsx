import React, { useState, useEffect } from 'react';
import useMedia from '../../hooks/Media/useMedia';
import UploadStudentMediaModal from '../../components/Modals/Media/UploadStudentMediaModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

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
    toast,
    showToast,
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

  const handleStudentUpload = async (file, provider, docType, customStudentId = '', customStudentName = '') => {
    // We prepend the tags so the backend can search it effortlessly
    const stdPrefix = customStudentId.trim() ? `[STD-${customStudentId.trim()}]-` : '';
    const nameSuffix = customStudentName.trim() ? ` - ${customStudentName.trim()}` : '';
    const fileBaseName = file.name.split('.').slice(0, -1).join('.');
    const fileExtension = file.name.split('.').pop();
    
    const taggedName = `${stdPrefix}[${docType}]-${fileBaseName}${nameSuffix}.${fileExtension}`;
    const taggedFile = new window.File([file], taggedName, { type: file.type });
    
    return await uploadMedia(taggedFile, provider);
  };

  return (
    <div className="space-y-4">
      {/* Student Selector Card */}
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <UserCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Student Profile Media</h2>
            <p className="text-xs text-slate-500">Manage passports and certificates</p>
          </div>
        </div>

        <form onSubmit={handleFindStudent} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Student ID (e.g. 101)"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
            {activeStudentId && (
              <button
                type="button"
                onClick={clearStudent}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!studentIdInput.trim() || activeStudentId === studentIdInput.trim()}
          >
            Find
          </Button>
        </form>
      </div>

      {!activeStudentId ? (
        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="rounded-2xl border shadow-sm p-12 text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border">
            <Search className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Student Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Enter a student ID in the search bar above to view, add, or manage their attached documents like passports and certificates.
          </p>
        </div>
      ) : (
        <div
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          className="rounded-2xl border shadow-sm overflow-hidden"
        >
          {/* Active Student Toolbar */}
          <div className="p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Badge variant="blue" icon={UserCircle}>Student ID: {activeStudentId}</Badge>
              <span className="text-xs text-slate-500 font-medium">{totalCount} documents found</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Upload}
                onClick={() => setIsUploadOpen(true)}
              >
                Add Document
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-3 border-b bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          {loading && mediaList.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1E3A8A]" />
              <p className="font-semibold text-xs">Loading Student Documents...</p>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileBadge className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-bold text-sm text-slate-600">No Documents Found</p>
              <p className="text-xs mt-1 text-slate-400">This student does not have any attached documents.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-white text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Document Details</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Uploaded By</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs bg-white">
                  {mediaList.map((m) => {
                    const DocIcon = getDocIcon(m.original_name);
                    // Extract clean name, removing the tags [STD-123]-[Passport]-filename
                    const nameParts = m.original_name.split('-');
                    const cleanName = nameParts.length > 2 ? nameParts.slice(2).join('-').trim() : m.original_name;
                    const docTypeMatch = m.original_name.match(/\[(.*?)\]/g);
                    const docType = docTypeMatch && docTypeMatch.length > 1 ? docTypeMatch[1].replace(/[\[\]]/g, '') : 'Document';

                    return (
                      <tr key={m.media_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                              <DocIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                {docType}
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                                  {(m.file_size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={cleanName}>
                                {cleanName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${m.provider === 'google_drive' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {m.provider === 'google_drive' ? 'Google Drive' : 'Supabase'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {m.uploader ? (
                            <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                              {m.uploader.name || m.uploader.email || 'User'}
                            </p>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => openMediaUrl(m.media_id, m.provider)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors"
                            title="View / Download"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMedia(m.media_id, m.provider)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Document"
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
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <p className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-700">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
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
      )}

      {/* Custom Upload Modal for Students */}
      <UploadStudentMediaModal
        isOpen={isUploadOpen}
        studentId={activeStudentId}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleStudentUpload}
      />
    </div>
  );
}
