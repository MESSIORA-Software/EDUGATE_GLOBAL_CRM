import React, { useState, useEffect } from 'react';
import PipelineService from '../../../../services/Admin/pipelineService';
import useAuth from '../../../../hooks/Auth/useAuth';
import { COLORS } from '../../../../constants/colors';
import { TYPOGRAPHY } from '../../../../constants/typography';
import Button from '../../../ui/Button';
import {
  X,
  StickyNote,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  Loader2,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';

export default function OpportunityNoteModal({ isOpen, opportunity, onClose, onSuccess }) {
  const { user: currentUser } = useAuth();
  const [noteContent, setNoteContent] = useState('');
  const [existingNoteId, setExistingNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const studentName = opportunity?.client?.name || `Student #${opportunity?.client_id || ''}`;
  const oppId = opportunity?.opportunity_id;

  useEffect(() => {
    if (!isOpen || !opportunity) return;

    setError('');
    setIsEditing(false);

    // Check if opportunity already has a note or note_id
    if (opportunity.note_id) {
      setExistingNoteId(opportunity.note_id);
      loadNote(opportunity.note_id);
    } else if (opportunity.note) {
      setNoteContent(opportunity.note);
      setExistingNoteId(opportunity.note_id || null);
    } else {
      setNoteContent('');
      setExistingNoteId(null);
      setIsEditing(true);
    }
  }, [isOpen, opportunity]);

  const loadNote = async (noteId) => {
    try {
      setLoading(true);
      const res = await PipelineService.getOpportunityNoteById(noteId);
      const noteData = res?.data?.data || res?.data;
      if (noteData?.note) {
        setNoteContent(noteData.note);
        setExistingNoteId(noteData.note_id || noteId);
      }
    } catch (err) {
      console.warn('Could not load specific note details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !opportunity) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      setError('Note content cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (existingNoteId) {
        // Update existing note
        await PipelineService.updateOpportunityNote(
          existingNoteId,
          oppId,
          noteContent.trim(),
          currentUser?.user_id || null
        );
        onSuccess?.('Opportunity note updated successfully!');
      } else {
        // Create new note
        const res = await PipelineService.createOpportunityNote(
          oppId,
          noteContent.trim(),
          currentUser?.user_id || null
        );
        const createdNote = res?.data?.data;
        const newNoteId = createdNote?.note_id;

        // Also update opportunity record with the note_id if available
        if (newNoteId) {
          try {
            await PipelineService.updateOpportunity(
              oppId,
              opportunity.client_id,
              opportunity.status_id,
              opportunity.assigned_staff_id,
              newNoteId
            );
          } catch {
            // non-blocking
          }
        }

        onSuccess?.('Opportunity note added successfully!');
      }

      setIsEditing(false);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to save note. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this opportunity note?')) return;

    try {
      setDeleting(true);
      setError('');

      if (existingNoteId) {
        await PipelineService.deleteOpportunityNote(existingNoteId);
      }

      // Clear note_id link on opportunity
      try {
        await PipelineService.updateOpportunity(
          oppId,
          opportunity.client_id,
          opportunity.status_id,
          opportunity.assigned_staff_id,
          null
        );
      } catch {
        // non-blocking
      }

      setNoteContent('');
      setExistingNoteId(null);
      onSuccess?.('Opportunity note deleted successfully!');
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to delete note. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 lg:left-60 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="rounded-2xl shadow-xl border border-blue-200/80 bg-white max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3.5 border-b"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs"
            >
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={TYPOGRAPHY.heading}>Opportunity Note</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                  #OPP-{oppId}
                </span>
              </div>
              <p className={TYPOGRAPHY.caption}>Manage notes for {studentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: COLORS.muted }}
            className="w-7 h-7 rounded-full hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="flex gap-2.5 p-3 border border-red-200 bg-red-50 text-red-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="h-36 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs">Loading note details...</p>
            </div>
          ) : !isEditing && noteContent ? (
            /* View Mode */
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-800 whitespace-pre-wrap font-medium shadow-2xs leading-relaxed">
                {noteContent}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Student: <strong className="text-slate-600">{studentName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Opportunity #{oppId}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Edit / Create Mode */
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={`${TYPOGRAPHY.label} block mb-1.5`}>
                  {existingNoteId ? 'Edit Note' : 'Add New Note'}
                </label>
                <textarea
                  rows={5}
                  placeholder="Write important notes about this student's inquiry, follow-ups, requirements, or conversation updates..."
                  value={noteContent}
                  onChange={(e) => {
                    setNoteContent(e.target.value);
                    setError('');
                  }}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all resize-none shadow-2xs"
                  autoFocus
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}
          className="flex items-center justify-between px-5 py-3 border-t"
        >
          <div>
            {!isEditing && noteContent && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Delete Note'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && noteContent ? (
              <>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Note
                </Button>
              </>
            ) : (
              <>
                {noteContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (existingNoteId) setIsEditing(false);
                      else onClose();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  onClick={handleSave}
                >
                  {existingNoteId ? 'Update Note' : 'Save Note'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
