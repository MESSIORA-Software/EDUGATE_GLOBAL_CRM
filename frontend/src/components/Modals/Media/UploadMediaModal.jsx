import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, File, Image as ImageIcon, AlertCircle, Eye, EyeOff, Tag, AlignLeft, User, UserCircle } from 'lucide-react';
import Button from '../../ui/Button';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CATEGORIES = [
  'General',
  'Passports & IDs',
  'Offer Letters',
  'Visa Applications',
  'Bank Statements & Financials',
  'Educational Certificates',
  'English Tests (IELTS/PTE)',
  'Medical Reports',
  'Contracts & Agreements',
  'Invoices & Receipts',
  'Marketing Materials',
  'Other'
];

export default function UploadMediaModal({ isOpen, onClose, onUpload, isStudentMode }) {
  // State for multiple files
  const [filesData, setFilesData] = useState([]);
  
  // Global settings for the batch
  const [description, setDescription] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // overall progress
  const [localError, setLocalError] = useState('');
  
  const fileInputRef = useRef(null);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      filesData.forEach(fd => {
        if (fd.preview) URL.revokeObjectURL(fd.preview);
      });
    };
  }, [filesData]);

  if (!isOpen) return null;

  const processSelectedFiles = (selectedFiles) => {
    setLocalError('');
    const validFiles = Array.from(selectedFiles).filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        setLocalError('One or more files exceed the 20MB limit and were skipped.');
        return false;
      }
      return true;
    });

    const newFilesData = validFiles.map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        id: Math.random().toString(36).substr(2, 9),
        originalFile: file,
        customName: file.name.split('.').slice(0, -1).join('.'), // remove extension
        extension: file.name.split('.').pop(),
        category: 'General',
        preview: isImage ? URL.createObjectURL(file) : null,
        isImage
      };
    });

    setFilesData(prev => [...prev, ...newFilesData]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) processSelectedFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) processSelectedFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    setFilesData(prev => prev.filter(f => f.id !== id));
  };

  const updateCustomName = (id, newName) => {
    setFilesData(prev => prev.map(f => f.id === id ? { ...f, customName: newName } : f));
  };

  const updateFileCategory = (id, newCategory) => {
    setFilesData(prev => prev.map(f => f.id === id ? { ...f, category: newCategory } : f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (filesData.length === 0) return;

    setIsUploading(true);
    setLocalError('');
    let successCount = 0;

    for (let i = 0; i < filesData.length; i++) {
      const fd = filesData[i];
      // Construct a tagged filename
      let finalName = '';
      if (isStudentMode) {
        const stdPrefix = studentId.trim() ? `[STD-${studentId.trim()}]-` : '';
        const nameSuffix = studentName.trim() ? ` - ${studentName.trim()}` : '';
        finalName = `${stdPrefix}[${fd.category}] ${fd.customName}${nameSuffix}.${fd.extension}`;
      } else {
        finalName = `[${fd.category}] ${fd.customName}.${fd.extension}`;
      }
      
      // Create a new File object with the modified name
      const modifiedFile = new window.File([fd.originalFile], finalName, { type: fd.originalFile.type });
      
      // Since backend doesn't support description natively in DB schema yet, we can attach it as a custom property 
      // or just send it if backend uses FormData for it later.
      modifiedFile.description = description; 

      // For this frontend-only build, we pass it to the existing onUpload hook which hits the backend
      const success = await onUpload(modifiedFile, 'supabase'); // Defaulting to supabase as provider was removed
      if (success) successCount++;
      
      // Fake progress increment for UX
      setUploadProgress(Math.round(((i + 1) / filesData.length) * 100));
    }

    setIsUploading(false);
    setUploadProgress(0);

    if (successCount === filesData.length) {
      setFilesData([]);
      setDescription('');
      setStudentId('');
      setStudentName('');
      onClose();
    } else {
      setLocalError(`${filesData.length - successCount} files failed to upload.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-2xl border max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Advanced Media Upload</h3>
              <p className="text-xs text-slate-500">Upload multiple files with metadata</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {localError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {/* 1. Multiple File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-[#1E3A8A] hover:bg-blue-50/30 group"
          >
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-[#1E3A8A] mx-auto transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 mt-3">Click or drag files here to upload</p>
            <p className="text-xs text-slate-400 mt-1">Supports multiple files (Max 20MB each)</p>
          </div>

          {/* 2 & 4. File List with Preview and Custom Name */}
          {filesData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Selected Files ({filesData.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filesData.map((fd) => (
                  <div key={fd.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white relative group">
                    {/* Image Preview or File Icon */}
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                      {fd.isImage && fd.preview ? (
                        <img src={fd.preview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <File className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Custom Name Input */}
                      <input
                        type="text"
                        value={fd.customName}
                        onChange={(e) => updateCustomName(fd.id, e.target.value)}
                        className="w-full text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1E3A8A] focus:outline-none transition-colors truncate mb-1.5"
                        placeholder="File name"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={fd.category}
                          onChange={(e) => updateFileCategory(fd.id, e.target.value)}
                          className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">.{fd.extension} • {(fd.originalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(fd.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-all absolute right-2 top-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Meta Settings */}
          {filesData.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                <AlignLeft className="w-3.5 h-3.5" />
                Batch Metadata
              </h4>

              {/* Optional Student Linking */}
              {isStudentMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <UserCircle className="w-3.5 h-3.5" /> Student Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                </div>
              )}



              {/* 2. File Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" /> Description / Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context or remarks for these files..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] min-h-[60px] resize-none"
                />
              </div>
            </div>
          )}

          {/* 5. Upload Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#1E3A8A]">Uploading {filesData.length} files...</span>
                <span className="text-slate-500">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1E3A8A] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filesData.length > 0 ? `${filesData.length} files ready` : 'No files selected'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleSubmit}
              disabled={filesData.length === 0 || isUploading}
              loading={isUploading}
            >
              Upload {filesData.length > 0 ? `(${filesData.length})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
