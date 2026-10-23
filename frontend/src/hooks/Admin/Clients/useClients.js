import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClients,
  addClient,
  updateClient,
  deleteClient,
  getClientById,
} from '../../../actions/Admin/clientAction';

import useAuth from '../../Auth/useAuth';
import { getUserRole } from '../../../utils/roleUtils';

export default function useClients() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  const {
    list: clients = [],
    loading: apiLoading = false,
    adding = false,
    updating = false,
    deleting = false,
    error = null,
  } = useSelector((state) => state.client ?? {});

  const { opportunities = [] } = useSelector((state) => state.pipeline ?? {});

  const assignedClientIds = useMemo(() => {
    if (isSuperAdmin) return null;
    const ids = new Set();
    opportunities.forEach((o) => {
      if (Number(o.assigned_staff_id) === Number(user?.user_id) && o.client_id) {
        ids.add(Number(o.client_id));
      }
    });
    return ids;
  }, [isSuperAdmin, opportunities, user?.user_id]);

  const baseClients = useMemo(() => {
    // If backend already filtered or if admin, return clients directly
    if (isSuperAdmin) return clients;
    if (assignedClientIds && assignedClientIds.size > 0) {
      return clients.filter((c) => assignedClientIds.has(Number(c.client_id || c.id)));
    }
    return clients;
  }, [clients, isSuperAdmin, assignedClientIds]);

  const submitting = adding || updating || deleting;

  // Local UI state
  const [searchTerm, setSearchTerm]   = useState('');
  const [findIdInput, setFindIdInput] = useState('');
  const [isFinding, setIsFinding]     = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen]         = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [detailClient, setDetailClient]   = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Load on mount
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchClients());
    showToast('Client list refreshed');
  }, [dispatch, showToast]);

  const handleFindById = async (e) => {
    e?.preventDefault();
    const id = findIdInput.trim();
    if (!id) return;

    setIsFinding(true);
    const res = await dispatch(getClientById(id));
    setIsFinding(false);

    if (res?.success && res.data) {
      setDetailClient(res.data);
      showToast(`Client #${id} found!`);
    } else {
      showToast(res?.error || `Client #${id} not found`, 'error');
    }
  };

  const handleAddClient = async (name, email, dob, source, referrer_id = null) => {
    const res = await dispatch(addClient(name, email, dob, source, referrer_id));
    if (res?.success) {
      showToast(`Client "${name}" created successfully!`);
    } else {
      showToast(res?.error || 'Failed to create client', 'error');
    }
    return res;
  };

  const handleUpdateClient = async (clientId, name, email, dob, source, referrer_id = null) => {
    const res = await dispatch(updateClient(clientId, name, email, dob, source, referrer_id));
    if (res?.success) {
      showToast(`Client #${clientId} updated successfully!`);
    } else {
      showToast(res?.error || 'Failed to update client', 'error');
    }
    return res;
  };

  const handleDeleteClient = async (clientId, clientName = '') => {
    const label = clientName ? `"${clientName}"` : `Client #${clientId}`;
    if (!window.confirm(`Are you sure you want to delete ${label}?`)) {
      return { success: false };
    }
    const res = await dispatch(deleteClient(clientId));
    if (res?.success) {
      showToast(`Client #${clientId} deleted successfully!`);
    } else {
      showToast(res?.error || `Failed to delete Client #${clientId}`, 'error');
    }
    return res;
  };

  const totalCount = baseClients.length;

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return [...baseClients];
    const q = searchTerm.toLowerCase().trim();
    return baseClients.filter((c) =>
      String(c?.client_id ?? c?.id ?? '').includes(q) ||
      (c?.name   ?? '').toLowerCase().includes(q) ||
      (c?.email  ?? '').toLowerCase().includes(q) ||
      (c?.source ?? '').toLowerCase().includes(q) ||
      (c?.dob    ?? '').toLowerCase().includes(q)
    );
  }, [baseClients, searchTerm]);

  return {
    clients: baseClients,
    filteredClients,
    apiLoading,
    adding,
    updating,
    deleting,
    submitting,
    error,
    totalCount,

    searchTerm, setSearchTerm,
    findIdInput, setFindIdInput,
    isFinding,
    handleFindById,

    isAddOpen,     setIsAddOpen,
    editingClient, setEditingClient,
    detailClient,  setDetailClient,

    toast,
    showToast,

    handleAddClient,
    handleUpdateClient,
    handleDeleteClient,
    handleRefresh,
  };
}
