import React, { useState, useEffect } from 'react';
import PipelineService from '../../../../services/Admin/pipelineService';
import useAuth from '../../../../hooks/Auth/useAuth';
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

  const student = opportunity?.client || {};
  const studentName = student.name || `Student #${opportunity?.client_id || ''}`;
  const oppId = opportunity?.opportunity_id;

  useEffect(() => {
    if (!isOpen || !opportunity) return;

    setError('');
    setIsEditing(false);

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
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {existingNoteId ? (isEditing ? 'Edit Opportunity Note' : 'View Opportunity Note') : 'Add Opportunity Note'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Internal remarks and follow-up history for {studentName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="flex gap-2.5 p-3.5 border border-red-200 bg-red-50 text-red-800 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Opportunity Student Context Card */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  EDU_OPP_{oppId}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                  {studentName}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  {student.email || 'No email'} {student.phone ? `• ${student.phone}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Stage
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {opportunity.status_name || 'Active'}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">Loading note details...</span>
              </div>
            ) : isEditing ? (
              <form id="note-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {existingNoteId ? 'Edit Note Content' : 'New Note Content'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {noteContent.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write detailed notes regarding this student's inquiry, program preferences, document status, or follow-up call outcomes..."
                    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    autoFocus
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Quick suggestions:</span>
                  {['Called - No answer', 'Interested in UK Master program', 'Awaiting IELTS score', 'Application submitted'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNoteContent((prev) => prev ? `${prev}\n• ${tag}` : tag)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer border border-slate-200"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4 text-amber-500" />
                    <span>Saved Note</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {noteContent ? (
                  <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {noteContent}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No note saved yet for this opportunity.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div>
              {existingNoteId && !isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? 'Deleting...' : 'Delete Note'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Close
              </Button>
              {isEditing ? (
                <Button
                  variant="primary"
                  type="submit"
                  form="note-form"
                  loading={saving}
                >
                  Save Note
                </Button>
              ) : (
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Note
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
