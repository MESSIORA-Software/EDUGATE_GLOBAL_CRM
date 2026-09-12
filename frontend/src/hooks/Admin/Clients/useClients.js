import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClients,
  addClient,
  updateClient,
  deleteClient,
  getClientById,
} from '../../../actions/Admin/clientAction';

export default function useClients() {
  const dispatch = useDispatch();

  const {
    list: clients = [],
    loading: apiLoading = false,
    adding = false,
    updating = false,
    deleting = false,
    error = null,
  } = useSelector((state) => state.client ?? {});

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

  const handleAddClient = async (name, email, dob, source) => {
    const res = await dispatch(addClient(name, email, dob, source));
    if (res?.success) {
      showToast(`Client "${name}" created successfully!`);
    } else {
      showToast(res?.error || 'Failed to create client', 'error');
    }
    return res;
  };

  const handleUpdateClient = async (clientId, name, email, dob, source) => {
    const res = await dispatch(updateClient(clientId, name, email, dob, source));
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

  const totalCount = clients.length;

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return [...clients];
    const q = searchTerm.toLowerCase().trim();
    return clients.filter((c) =>
      String(c?.client_id ?? c?.id ?? '').includes(q) ||
      (c?.name   ?? '').toLowerCase().includes(q) ||
      (c?.email  ?? '').toLowerCase().includes(q) ||
      (c?.source ?? '').toLowerCase().includes(q) ||
      (c?.dob    ?? '').toLowerCase().includes(q)
    );
  }, [clients, searchTerm]);

  return {
    clients,
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
