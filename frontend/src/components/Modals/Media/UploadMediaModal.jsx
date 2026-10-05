import React, { useState, useRef } from 'react';
import { UploadCloud, X, File, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

export default function UploadMediaModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [provider, setProvider] = useState('supabase');
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setLocalError('');
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 20 * 1024 * 1024) {
        setLocalError('File size exceeds the 20MB limit.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setLocalError('');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 20 * 1024 * 1024) {
        setLocalError('File size exceeds the 20MB limit.');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setLocalError('');
    const success = await onUpload(file, provider);
    setIsUploading(false);

    if (success) {
      setFile(null);
      setProvider('supabase');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="rounded-2xl shadow-xl border max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            >
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Upload Media</h3>
              <p className={TYPOGRAPHY.caption}>Upload document or image file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {localError && (
            <div
              style={{ backgroundColor: COLORS.secondaryLight, borderColor: COLORS.secondaryBorder, color: COLORS.secondary }}
              className="flex items-center gap-2 p-2.5 border rounded-xl text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Select File</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ backgroundColor: COLORS.background, borderColor: file ? COLORS.primary : COLORS.border }}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-slate-400"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-8 h-8" style={{ color: COLORS.primary }} />
                  ) : (
                    <File className="w-8 h-8" style={{ color: COLORS.primary }} />
                  )}
                  <div>
                    <p className="text-xs font-bold" style={{ color: COLORS.foreground }}>{file.name}</p>
                    <p className="text-[11px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Click or drag file to upload</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size: 20MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Storage Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="supabase">Supabase Storage (Private)</option>
              {localStorage.getItem('google_access_token') && (
                <option value="google_drive">Google Drive</option>
              )}
            </select>
          </div>

          {/* Actions */}
          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!file}
              loading={isUploading}
            >
              Upload File
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
