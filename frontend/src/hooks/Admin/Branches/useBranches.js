import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  fetchUsersByBranch,
  findBranchById,
} from '../../../actions/Admin/branchAction';


export default function useBranches() {
  const dispatch = useDispatch();

  // ── Redux state ────────────────────────────────────────────
  const {
    list: branches = [],
    loading: apiLoading = false,
    adding = false,
    updating = false,
    deleting = false,
    users: branchUsers = [],
    usersLoading = false,
    error = null,
  } = useSelector((state) => state.branch ?? {});

  const submitting = adding || updating || deleting;

  // ── Local UI state ─────────────────────────────────────────
  const [searchTerm, setSearchTerm]       = useState('');
  const [findIdInput, setFindIdInput]     = useState('');
  const [isFinding, setIsFinding]         = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen]             = useState(false);
  const [editingBranch, setEditingBranch]     = useState(null);
  const [detailBranch, setDetailBranch]       = useState(null);
  const [usersBranch, setUsersBranch]         = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // ── Toast helper ───────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Load on mount ──────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  // ── Refresh ────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    dispatch(fetchBranches());
    showToast('Branch list refreshed');
  }, [dispatch, showToast]);

  // ── Find branch by ID (API #3) ─────────────────────────────
  const handleFindById = async (e) => {
    e?.preventDefault();
    const id = findIdInput.trim();
    if (!id) return;

    setIsFinding(true);
    const res = await dispatch(findBranchById(id));
    setIsFinding(false);

    if (res?.success && res.data) {
      setDetailBranch(res.data);
      showToast(`Branch #${id} found!`);
    } else {
      showToast(res?.error || `Branch #${id} not found`, 'error');
    }
  };

  // ── Add branch (API #1) ────────────────────────────────────
  const handleAddBranch = async (name, address, phone) => {
    const res = await dispatch(addBranch(name, address, phone));
    if (res?.success) {
      showToast(`Branch "${name}" created successfully!`);
    } else {
      showToast(res?.error || 'Failed to create branch', 'error');
    }
    return res;
  };

  // ── Update branch (API #4) ─────────────────────────────────
  const handleUpdateBranch = async (branchId, name, address, phone) => {
    const res = await dispatch(updateBranch(branchId, name, address, phone));
    if (res?.success) {
      showToast(`Branch #${branchId} updated successfully!`);
    } else {
      showToast(res?.error || 'Failed to update branch', 'error');
    }
    return res;
  };

  // ── Delete branch (API #5) ─────────────────────────────────
  const handleDeleteBranch = async (branchId, branchName = '') => {
    const label = branchName ? `"${branchName}"` : `Branch #${branchId}`;
    if (!window.confirm(`Are you sure you want to delete ${label}?`)) {
      return { success: false };
    }
    const res = await dispatch(deleteBranch(branchId));
    if (res?.success) {
      showToast(`Branch #${branchId} deleted successfully!`);
    } else {
      showToast(res?.error || `Failed to delete Branch #${branchId}`, 'error');
    }
    return res;
  };

  // ── View branch users (API #6) ─────────────────────────────
  const handleViewBranchUsers = async (branch) => {
    const id = branch?.branch_id || branch?.id;
    if (!id) return;
    setUsersBranch(branch);
    await dispatch(fetchUsersByBranch(id));
  };

  // ── Helpers ────────────────────────────────────────────────
  const getBadgeCode = (name) =>
    name ? name.trim().toUpperCase().slice(0, 3) : '??';

  const getBranchById = (id) =>
    id
      ? branches.find((b) => String(b.branch_id ?? b.id) === String(id))
      : null;

  // ── Derived values ─────────────────────────────────────────
  const totalCount  = branches.length;
  const activeCount = branches.length;

  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) return [...branches];
    const q = searchTerm.toLowerCase().trim();
    return branches.filter((b) =>
      String(b?.branch_id ?? b?.id ?? '').includes(q) ||
      (b?.name    ?? '').toLowerCase().includes(q)    ||
      (b?.address ?? '').toLowerCase().includes(q)    ||
      (b?.phone   ?? '').toLowerCase().includes(q)
    );
  }, [branches, searchTerm]);

  // ── Return ─────────────────────────────────────────────────
  return {
    branches,
    filteredBranches,
    apiLoading,
    adding,
    updating,
    deleting,
    submitting,
    error,
    totalCount,
    activeCount,

    // Search / Find
    searchTerm, setSearchTerm,
    findIdInput, setFindIdInput,
    isFinding,
    handleFindById,

    // Modals
    isAddOpen,    setIsAddOpen,
    editingBranch, setEditingBranch,
    detailBranch,  setDetailBranch,
    usersBranch,   setUsersBranch,

    // Users
    branchUsers,
    usersLoading,
    handleViewBranchUsers,

    // Toast
    toast,
    showToast,

    // CRUD
    handleAddBranch,
    handleUpdateBranch,
    handleDeleteBranch,
    handleRefresh,

    // Helpers
    getBadgeCode,
    getBranchById,
  };
}