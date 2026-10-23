import React, { useState, useEffect } from 'react';
import referrerService from '../../../../services/Admin/referrerService';
import {
  X,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  Users,
  Loader2,
  Copy,
  Check,
  Edit2,
} from 'lucide-react';

export default function ReferrerDetailModal({ isOpen, referrer, onClose, onEdit }) {
  const [students, setStudents] = useState([]);
  const [score, setScore] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (isOpen && referrer?.referrer_id) {
      setLoadingStudents(true);
      referrerService
        .getReferrerStudents(referrer.referrer_id)
        .then((res) => {
          const fetchedStudents =
            res?.data?.data?.students ||
            res?.data?.students ||
            [];
          setStudents(fetchedStudents);
          const calculatedScore =
            res?.data?.data?.score !== undefined
              ? res.data.data.score
              : fetchedStudents.length * 10;
          setScore(calculatedScore);
        })
        .catch(() => {
          setStudents([]);
          setScore(0);
        })
        .finally(() => {
          setLoadingStudents(false);
        });
    } else {
      setStudents([]);
      setScore(0);
    }
  }, [isOpen, referrer]);

  if (!isOpen || !referrer) return null;

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const studentCount = students.length;
  const calculatedTotalScore = studentCount * 10;

  return (
    <div className="fixed inset-0 lg:left-60 z-40 overflow-hidden animate-in fade-in duration-200">
      {/* Light subtle backdrop (sidebar remains fully available and interactive) */}
      <div
        className="fixed inset-0 lg:left-60 bg-slate-900/15 backdrop-blur-[1px] transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Right Half-Page Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-2xl md:w-[50vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300 ease-out">
          {/* Drawer Header without icon box */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {referrer.name}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    referrer.status === 'Inactive'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {referrer.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Partner profile, referral performance score, and student recommendations
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
            {/* Referrer System ID Indicator */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Referrer Unique Code
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50/70 border border-blue-200/80 px-3 py-1 rounded-lg shadow-2xs tracking-wider">
                    {referrer.referrer_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(referrer.referrer_code, 'ref-code')}
                    className="p-1 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    title="Copy Referrer Code"
                  >
                    {copiedId === 'ref-code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Students created with this code will contribute to this partner's performance score.
              </p>
            </div>

            {/* Referrer Performance Score Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Referrer Performance Score
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  10 Pts / Student
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                  <span>{calculatedTotalScore}</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Points
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Calculation: <strong className="text-slate-800">{studentCount}</strong> student{studentCount !== 1 ? 's' : ''} × 10 score = <strong className="text-slate-900 font-semibold">{calculatedTotalScore} points</strong>
                </p>
              </div>
            </div>

            {/* REFERRED STUDENTS LIST SECTION */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Referred Students
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {studentCount} Total
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Students enrolled under this referee
                </span>
              </div>

              {loadingStudents ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs">Loading referred students...</span>
                </div>
              ) : studentCount === 0 ? (
                <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No students referred yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    When a student is added in the Students / Clients page with this referee selected, they will appear here and award 10 score points.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {students.map((student, idx) => {
                    const studentId = student.client_id || student.id;
                    const formattedStudentId = studentId
                      ? String(studentId).startsWith('EDU_STUDENT_')
                        ? String(studentId)
                        : `EDU_STUDENT_${studentId}`
                      : 'N/A';
                    const copyKey = `stud-${studentId || idx}`;

                    return (
                      <div
                        key={studentId || idx}
                        className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between hover:border-slate-300 hover:bg-white transition-all text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-800 font-bold flex items-center justify-center shrink-0">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{student.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                {formattedStudentId}
                              </span>
                              {student.email && (
                                <span className="text-[11px] text-slate-400 truncate">
                                  {student.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            +10 Score
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(formattedStudentId, copyKey)}
                            className="p-1 text-slate-400 hover:text-blue-700 hover:bg-white rounded border border-slate-200 transition-colors cursor-pointer"
                            title="Copy Student ID"
                          >
                            {copiedId === copyKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contact Details Grid */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Contact Information
                </h3>
                <span className="text-[11px] font-medium text-slate-400">Communication Channels</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
                  </span>
                  <p className="font-medium text-slate-800 truncate">
                    {referrer.email || <span className="text-slate-400 italic">Not provided</span>}
                  </p>
                </div>

                <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Number
                  </span>
                  <p className="font-medium text-slate-800 truncate">
                    {referrer.phone_number || <span className="text-slate-400 italic">Not provided</span>}
                  </p>
                </div>

                <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Number
                  </span>
                  <p className="font-medium text-slate-800 truncate">
                    {referrer.whatsapp_number || <span className="text-slate-400 italic">Not provided</span>}
                  </p>
                </div>

                <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Registered Date
                  </span>
                  <p className="font-medium text-slate-800">
                    {referrer.created_at
                      ? new Date(referrer.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Home Address Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Home / Office Address
              </span>
              <p className="font-medium text-slate-800">
                {referrer.home_address || <span className="text-slate-400 italic">Not provided</span>}
              </p>
            </div>

            {/* Note & Partnership Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-500" /> Notes & Agreements
              </span>
              <p className="font-medium text-slate-800 whitespace-pre-wrap">
                {referrer.note || <span className="text-slate-400 italic">No notes recorded</span>}
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(referrer);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Referrer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
