import React, { useState, useEffect } from 'react';
import { Pencil, X, AlertCircle } from 'lucide-react';
import Button from '../../ui/Button';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

export default function RenameDocumentModal({ isOpen, document, onClose, onRename }) {
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen && document) {
      setDocumentName(document.document_name || '');
      setDescription(document.description || '');
      setLocalError('');
      setIsSubmitting(false);
    }
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const trimmed = documentName.trim();
    if (!trimmed) {
      setLocalError('Document Name is required.');
      return;
    }
    if (trimmed.length > 200) {
      setLocalError('Document Name cannot exceed 200 characters.');
      return;
    }
    setIsSubmitting(true);
    const success = await onRename(document.id, trimmed, description.trim() || null);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-sm w-full overflow-hidden">
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3.5 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-amber-700">
              <Pencil className="w-4 h-4" />
            </div>
            <h3 className={TYPOGRAPHY.heading}>Rename Document</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

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
            <label className={`${TYPOGRAPHY.label} block mb-1`}>
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => { setDocumentName(e.target.value); setLocalError(''); }}
              maxLength={200}
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className={`${TYPOGRAPHY.label} block mb-1`}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.foreground }}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div style={{ borderColor: COLORS.border }} className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={!documentName.trim()} loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
