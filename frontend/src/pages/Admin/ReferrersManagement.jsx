import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReferrerService from '../../services/Admin/referrerService';
import AddReferrerModal from '../../components/Modals/Admin/Referrer/AddReferrerModal';
import EditReferrerModal from '../../components/Modals/Admin/Referrer/EditReferrerModal';
import ReferrerDetailModal from '../../components/Modals/Admin/Referrer/ReferrerDetailModal';
import ManageReferrerPaymentsModal from '../../components/Modals/Admin/Referrer/ManageReferrerPaymentsModal';
import {
  Award,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Filter,
  ChevronDown,
  X,
  UserPlus,
  Wallet,
  Calendar,
} from 'lucide-react';

export default function ReferrersManagement() {
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Drawer Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReferrer, setEditingReferrer] = useState(null);
  const [detailReferrer, setDetailReferrer] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchReferrers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ReferrerService.getAllReferrers();
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setReferrers(list);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to fetch referrers', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReferrers();
  }, [fetchReferrers]);

  const filteredReferrers = useMemo(() => {
    return referrers.filter((r) => {
      // Payment Status filter
      if (paymentStatusFilter !== 'ALL') {
        const pStatus = (r.payment_status || 'No Due').toUpperCase();
        if (paymentStatusFilter === 'PENDING' && !pStatus.includes('PENDING')) return false;
        if (paymentStatusFilter === 'PAID' && pStatus !== 'PAID') return false;
        if (paymentStatusFilter === 'PARTIALLY_PAID' && pStatus !== 'PARTIALLY PAID') return false;
        if (paymentStatusFilter === 'NO_DUE' && pStatus !== 'NO DUE') return false;
      }

      // Month filter
      if (selectedMonth !== 'ALL') {
        const date = r.created_at ? new Date(r.created_at) : null;
        if (!date || date.getMonth() !== Number(selectedMonth)) return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      const code = (r.referrer_code || '').toLowerCase();
      const name = (r.name || '').toLowerCase();
      const email = (r.email || '').toLowerCase();
      const phone = (r.phone_number || '').toLowerCase();
      const whatsapp = (r.whatsapp_number || '').toLowerCase();
      const address = (r.home_address || '').toLowerCase();
      const note = (r.note || '').toLowerCase();

      return (
        code.includes(term) ||
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        whatsapp.includes(term) ||
        address.includes(term) ||
        note.includes(term)
      );
    });
  }, [referrers, searchTerm, paymentStatusFilter, selectedMonth]);

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

      {/* Page Header matching User Accounts */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Referrers & Partners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage referral partners, unique referral codes, student recommendations, and commission tracking.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-end flex-wrap gap-2.5">
          <button
            onClick={fetchReferrers}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50/40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Payments</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-900 text-xs font-semibold hover:bg-blue-50 hover:border-blue-600 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add New Referrer</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row gap-3 justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-1">
          {/* Search input */}
          <div className="relative w-full sm:w-80 group">
            <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by code, name, phone, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-blue-200/80 bg-white rounded-xl text-xs font-medium text-slate-700 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-md transition-all cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Payment Status Filter Dropdown */}
          <div className="relative w-full sm:w-44">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="appearance-none w-full pl-8 pr-8 py-2 border border-blue-200/80 bg-white rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Payment</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="NO_DUE">No Due</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-blue-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Month Filter Dropdown */}
          <div className="relative w-full sm:w-40">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none w-full pl-8 pr-8 py-2 border border-blue-200/80 bg-white rounded-xl text-xs font-semibold text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-xs"
            >
              <option value="ALL">All Months</option>
              <option value="0">January</option>
              <option value="1">February</option>
              <option value="2">March</option>
              <option value="3">April</option>
              <option value="4">May</option>
              <option value="5">June</option>
              <option value="6">July</option>
              <option value="7">August</option>
              <option value="8">September</option>
              <option value="9">October</option>
              <option value="10">November</option>
              <option value="11">December</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-blue-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {(paymentStatusFilter !== 'ALL' || selectedMonth !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setPaymentStatusFilter('ALL');
                setSelectedMonth('ALL');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer px-2 py-1 shrink-0"
              title="Reset Filters"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Referrer ID</th>
                <th className="py-3.5 px-4">Referrer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Home Address</th>
                <th className="py-3.5 px-4">Note / Partnership</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && referrers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold text-xs">Loading referrers...</p>
                  </td>
                </tr>
              ) : filteredReferrers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Award className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-sm text-slate-700">No Referrers Found</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm || paymentStatusFilter !== 'ALL' || selectedMonth !== 'ALL'
                          ? 'No referrers match your search or filter criteria.'
                          : 'Get started by adding your first referral partner.'}
                      </p>
                      {!searchTerm && paymentStatusFilter === 'ALL' && selectedMonth === 'ALL' && (
                        <button
                          type="button"
                          onClick={() => setIsAddOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Referrer</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReferrers.map((ref) => {
                  const initials = ref.name
                    ? ref.name
                        .trim()
                        .split(/\s+/)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'RF';

                  return (
                    <tr
                      key={ref.referrer_id}
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      {/* Referrer Unique Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50/80 border border-blue-200/80 px-2 py-0.5 rounded-md inline-block shadow-2xs">
                          {ref.referrer_code}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-blue-700 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                              {ref.name}
                            </p>
                            {ref.email && (
                              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400 inline shrink-0" />
                                {ref.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info: Phone & WhatsApp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {ref.phone_number ? (
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{ref.phone_number}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No phone</span>
                          )}

                          {ref.whatsapp_number && (
                            <a
                              href={`https://wa.me/${ref.whatsapp_number.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-emerald-700 font-medium hover:underline text-[11px]"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{ref.whatsapp_number}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Home Address */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {ref.home_address ? (
                          <div className="flex items-start gap-1 text-slate-600 truncate" title={ref.home_address}>
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="truncate">{ref.home_address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not provided</span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        {ref.note ? (
                          <p className="text-slate-600 truncate" title={ref.note}>
                            {ref.note}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No notes</span>
                        )}
                      </td>

                      {/* Payment Status Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {ref.payment_status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        ) : ref.payment_status === 'Partially Paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Partially Paid
                          </span>
                        ) : ref.payment_status === 'Pending Payment' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending Payment
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            No Due
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailReferrer(ref)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Referrer Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReferrer(ref)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Referrer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Modals */}
      <AddReferrerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchReferrers();
        }}
      />

      <EditReferrerModal
        isOpen={!!editingReferrer}
        referrer={editingReferrer}
        onClose={() => setEditingReferrer(null)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchReferrers();
        }}
      />

      <ReferrerDetailModal
        isOpen={!!detailReferrer}
        referrer={detailReferrer}
        onClose={() => {
          setDetailReferrer(null);
          fetchReferrers();
        }}
        onEdit={(ref) => setEditingReferrer(ref)}
      />

      <ManageReferrerPaymentsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          fetchReferrers();
        }}
      />
    </div>
  );
}
