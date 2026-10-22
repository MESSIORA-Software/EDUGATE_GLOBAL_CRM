import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, File, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

export default function UploadStudentDocumentModal({ isOpen, student, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setDocumentName('');
      setDescription('');
      setLocalError('');
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setLocalError('');
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 20 * 1024 * 1024) {
        setLocalError('File size exceeds the 20 MB limit.');
        return;
      }
      setFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setLocalError('');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.size > 20 * 1024 * 1024) {
        setLocalError('File size exceeds the 20 MB limit.');
        return;
      }
      setFile(dropped);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const trimmedName = documentName.trim();
    if (!trimmedName) {
      setLocalError('Document Name is required.');
      return;
    }
    if (trimmedName.length > 200) {
      setLocalError('Document Name cannot exceed 200 characters.');
      return;
    }
    if (!file) {
      setLocalError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    const success = await onUpload(student.client_id, file, trimmedName, description.trim() || null);
    setIsUploading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-md w-full overflow-hidden">
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3.5 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-700">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className={TYPOGRAPHY.heading}>Add Document</h3>
              <p className="text-[10px] text-slate-500 font-mono font-semibold mt-0.5">
                {student?.name || 'Student'} · ID #{student?.client_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center transition-colors"
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

          {/* Student info (read-only display) */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Student</label>
            <div
              style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
              className="w-full px-3 py-2 border rounded-xl text-xs text-slate-600 font-medium"
            >
              {student?.name || '—'} <span className="text-slate-400 font-mono">· #{student?.client_id}</span>
            </div>
          </div>

          {/* Document Name — free-text, required */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => { setDocumentName(e.target.value); setLocalError(''); }}
              placeholder="e.g. NIC, Passport, O/L Certificate, Bank Statement…"
              maxLength={200}
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              autoFocus
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Enter any name — no predefined options.</p>
          </div>

          {/* Description — optional */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note about this document"
              maxLength={500}
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* File Drop Zone */}
          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              File <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: COLORS.background,
                borderColor: file ? COLORS.primary : COLORS.border,
              }}
              className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors hover:border-blue-400"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-1.5">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-7 h-7 text-blue-600" />
                  ) : (
                    <File className="w-7 h-7 text-blue-600" />
                  )}
                  <p className="text-xs font-bold text-slate-800">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-[10px] text-red-500 hover:underline mt-0.5"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Click or drag file to upload</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Max 20 MB · PDF, Image, Word, Excel, ZIP…</p>
                  </div>
                </div>
              )}
            </div>
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
              disabled={!file || !documentName.trim()}
              loading={isUploading}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
