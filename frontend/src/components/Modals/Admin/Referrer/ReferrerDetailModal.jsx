import React, { useState, useEffect, useCallback } from 'react';
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
  CreditCard,
  AlertCircle,
} from 'lucide-react';

export default function ReferrerDetailModal({ isOpen, referrer, onClose, onEdit }) {
  const [students, setStudents] = useState([]);
  const [ratePerStudent, setRatePerStudent] = useState(1000);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Settlement & Payout states
  const [payouts, setPayouts] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('Pending');

  const [isSettlingPayment, setIsSettlingPayment] = useState(false);
  const [payingAmount, setPayingAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNote, setReferenceNote] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState('');

  const fetchReferrerData = useCallback(() => {
    if (!referrer?.referrer_id) return;
    setLoadingStudents(true);
    referrerService
      .getReferrerStudents(referrer.referrer_id)
      .then((res) => {
        const data = res?.data?.data || res?.data || {};
        const fetchedStudents = data.students || [];
        setStudents(fetchedStudents);

        const rate =
          data.rate_per_student !== undefined
            ? data.rate_per_student
            : referrer?.payment_per_student || 1000;
        setRatePerStudent(Number(rate));

        const paid = Number(data.total_paid || 0);
        const total = Number(data.total_payable !== undefined ? data.total_payable : (fetchedStudents.length * Number(rate)));
        const pending = Number(data.pending_amount !== undefined ? data.pending_amount : Math.max(0, total - paid));
        
        let status = null;
        if (total > 0) {
          status = pending === 0 ? 'Paid' : 'Pending';
        } else if (paid > 0) {
          status = 'Paid';
        } else {
          status = null;
        }

        setPayouts(data.payouts || []);
        setTotalPaid(paid);
        setPendingAmount(pending);
        setPaymentStatus(status);
      })
      .catch(() => {
        setStudents([]);
        setRatePerStudent(Number(referrer?.payment_per_student) || 1000);
        setPayouts([]);
        setTotalPaid(0);
        setPendingAmount(0);
        setPaymentStatus(null);
      })
      .finally(() => {
        setLoadingStudents(false);
      });
  }, [referrer]);

  useEffect(() => {
    if (isOpen && referrer?.referrer_id) {
      setIsSettlingPayment(false);
      setPayoutError('');
      fetchReferrerData();
    } else {
      setStudents([]);
      setRatePerStudent(1000);
      setPayouts([]);
      setTotalPaid(0);
      setPendingAmount(0);
      setPaymentStatus(null);
      setIsSettlingPayment(false);
      setPayoutError('');
    }
  }, [isOpen, referrer, fetchReferrerData]);

  if (!isOpen || !referrer) return null;

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSettlePayment = async (e) => {
    e.preventDefault();
    setPayoutError('');

    const numericAmount = parseFloat(payingAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setPayoutError('Please enter a valid positive payment amount.');
      return;
    }

    try {
      setSubmittingPayout(true);
      await referrerService.addPayout(referrer.referrer_id, {
        amount: numericAmount,
        payment_method: paymentMethod,
        reference_note: referenceNote.trim() || null,
      });

      setIsSettlingPayment(false);
      setPayingAmount('');
      setReferenceNote('');
      fetchReferrerData();
    } catch (err) {
      setPayoutError(
        err?.response?.data?.message || err?.message || 'Failed to record payment. Please try again.'
      );
    } finally {
      setSubmittingPayout(false);
    }
  };

  const studentCount = students.length;
  const totalPayment = studentCount * ratePerStudent;

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
                Partner profile, referral commission payments, and student recommendations
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
                Students created with this code will contribute to this partner's commission payout.
              </p>
            </div>

            {/* Referral Payment / Commission Calculation Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Referral Commission Payment
                  </span>
                  {/* Payment Status Badge - only shown if totalPayment > 0 */}
                  {paymentStatus && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {paymentStatus}
                    </span>
                  )}
                </div>
              </div>

              {!isSettlingPayment ? (
                <div className="space-y-3">
                  {/* Key Figures Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Total Payable
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        Rs. {totalPayment.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Total Paid
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        Rs. {totalPaid.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Remaining Pending
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        Rs. {pendingAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Calculation: <strong className="text-slate-800">{studentCount}</strong> student{studentCount !== 1 ? 's' : ''} × Rs. {ratePerStudent.toLocaleString()} = <strong className="text-slate-900 font-bold">Rs. {totalPayment.toLocaleString()}</strong>
                  </p>

                  {/* Settle Pending Payment Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    {pendingAmount > 0 ? (
                      <>
                        <span className="text-[11px] text-slate-500">
                          Rs. {pendingAmount.toLocaleString()} pending settlement.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettlingPayment(true);
                            setPayingAmount(String(pendingAmount));
                            setPayoutError('');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          <span>Settle Pending Payment</span>
                        </button>
                      </>
                    ) : totalPayment > 0 ? (
                      <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        All commission payments have been settled in full.
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        No students referred yet. No commission payment due.
                      </span>
                    )}
                  </div>

                  {/* Previous Settlements History */}
                  {payouts.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Settlement History ({payouts.length})</span>
                        <span>Recorded Payments</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {payouts.map((p, idx) => (
                          <div
                            key={p.payout_id || idx}
                            className="p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  Rs. {Number(p.amount).toLocaleString()}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                                  {p.payment_method || 'Bank Transfer'}
                                </span>
                              </div>
                              {p.reference_note && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{p.reference_note}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {p.paid_at
                                ? new Date(p.paid_at).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Inline Settlement Form */
                <form onSubmit={handleSettlePayment} className="space-y-3.5 pt-1">
                  {payoutError && (
                    <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{payoutError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Amount to Pay (Rs.) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          Rs.
                        </span>
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="any"
                          placeholder="e.g. 5000"
                          value={payingAmount}
                          onChange={(e) => setPayingAmount(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white cursor-pointer"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Online / Card">Online / Card</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Reference / Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bank Ref #TX9841 / Cheque #49210"
                      value={referenceNote}
                      onChange={(e) => setReferenceNote(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>

                  {/* Live Balance Preview */}
                  <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Remaining Pending Before:</span>
                      <span className="font-semibold text-slate-900">Rs. {pendingAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Amount Paying Now:</span>
                      <span className="font-semibold text-slate-900">
                        Rs. {Number(payingAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-bold text-slate-900">
                      <span>Remaining Pending After:</span>
                      <span>
                        Rs. {Math.max(0, pendingAmount - Number(payingAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                    {Math.max(0, pendingAmount - Number(payingAmount || 0)) === 0 && (
                      <p className="text-[11px] font-semibold text-emerald-700 pt-0.5">
                        ✓ Full payment complete. Status will update to Paid upon confirmation.
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSettlingPayment(false)}
                      disabled={submittingPayout}
                      className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPayout}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submittingPayout ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm & Settle Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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
                    When a student is added in the Students / Clients page with this referee selected, they will appear here and earn commission.
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
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            +Rs. {ratePerStudent.toLocaleString()}
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
