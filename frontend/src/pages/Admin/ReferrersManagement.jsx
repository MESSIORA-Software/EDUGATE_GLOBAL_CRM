import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReferrerService from '../../services/Admin/referrerService';
import AddReferrerModal from '../../components/Modals/Admin/Referrer/AddReferrerModal';
import EditReferrerModal from '../../components/Modals/Admin/Referrer/EditReferrerModal';
import ReferrerDetailModal from '../../components/Modals/Admin/Referrer/ReferrerDetailModal';
import {
  Award,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Sparkles,
} from 'lucide-react';

export default function ReferrersManagement() {
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReferrer, setEditingReferrer] = useState(null);
  const [detailReferrer, setDetailReferrer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (referrer) => {
    const confirmMsg = `Are you sure you want to delete referrer "${referrer.name}" (${referrer.referrer_code})?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(referrer.referrer_id);
      await ReferrerService.deleteReferrer(referrer.referrer_id);
      showToast(`Referrer "${referrer.name}" deleted successfully!`);
      fetchReferrers();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to delete referrer', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReferrers = useMemo(() => {
    if (!searchTerm.trim()) return referrers;
    const term = searchTerm.toLowerCase().trim();
    return referrers.filter((r) => {
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
  }, [referrers, searchTerm]);

  // Metric stats
  const activeCount = useMemo(
    () => referrers.filter((r) => (r.status || 'Active') === 'Active').length,
    [referrers]
  );
  const whatsappCount = useMemo(
    () => referrers.filter((r) => Boolean(r.whatsapp_number)).length,
    [referrers]
  );

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

      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Referrers</p>
            <p className="text-2xl font-extrabold text-blue-950 mt-0.5">{referrers.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Partners</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">WhatsApp Enabled</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{whatsappCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-3.5 bg-white rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-blue-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by code (e.g. EDUGATE_REFERRER_01), name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-blue-200 bg-white rounded-xl text-xs font-medium text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={fetchReferrers}
            className="p-2 rounded-xl border border-blue-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/40 transition-all cursor-pointer shadow-2xs"
            title="Refresh Referrers List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Referrer</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-blue-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Referrer ID</th>
                <th className="py-3.5 px-4">Referrer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Home Address</th>
                <th className="py-3.5 px-4">Note / Partnership</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && referrers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="font-medium text-xs">Loading referrers...</p>
                  </td>
                </tr>
              ) : filteredReferrers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Award className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-800">No Referrers Found</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm ? 'No referrers match your search query.' : 'Get started by registering referral partners.'}
                      </p>
                      {!searchTerm && (
                        <button
                          type="button"
                          onClick={() => setIsAddOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
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
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Referrer Unique Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md inline-block shadow-2xs">
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

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (ref.status || 'Active') === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              (ref.status || 'Active') === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {ref.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailReferrer(ref)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Referrer Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReferrer(ref)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Referrer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ref)}
                            disabled={deletingId === ref.referrer_id}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Referrer"
                          >
                            {deletingId === ref.referrer_id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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

      {/* Modals */}
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
        onClose={() => setDetailReferrer(null)}
        onEdit={(ref) => setEditingReferrer(ref)}
      />
    </div>
  );
}
