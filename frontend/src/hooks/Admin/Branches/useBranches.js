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
import { fetchUsers } from '../../../actions/Admin/userActions';


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

  const { list: users = [] } = useSelector((state) => state.users ?? {});

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
  const [deletingBranch, setDeletingBranch]   = useState(null);

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
    dispatch(fetchUsers());
  }, [dispatch]);

  // ── Refresh ────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    dispatch(fetchBranches());
    dispatch(fetchUsers());
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
  const handleDeleteBranch = (branch) => {
    if (!branch) return;
    if (typeof branch === 'object') {
      setDeletingBranch(branch);
    } else {
      const found = branches.find((b) => String(b.branch_id ?? b.id) === String(branch));
      setDeletingBranch(found || { branch_id: branch, name: `Branch #${branch}` });
    }
  };

  // ── View branch users (API #6) ─────────────────────────────
  const handleViewBranchUsers = async (branch) => {
    const id = branch?.branch_id || branch?.id;
    if (!id) return;
    setUsersBranch(branch);
    await dispatch(fetchUsersByBranch(id));
  };

  // ── Helpers ────────────────────────────────────────────────
  const getBadgeCode = (input) => {
    if (!input) return 'EDUGATE_BRANCH';
    let str = typeof input === 'string' ? input : (input.branch_name || input.name || String(input.branch_id || input.id || 'BRANCH'));
    let clean = String(str).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!clean) return 'EDUGATE_BRANCH';
    return clean.startsWith('EDUGATE_') ? clean : `EDUGATE_${clean}`;
  };

  const getBranchById = (id) =>
    id
      ? branches.find((b) => String(b.branch_id ?? b.id) === String(id))
      : null;

  // ── Derived values ─────────────────────────────────────────
  const totalCount  = branches.length;
  const activeCount = branches.length;

  const adminUsers = useMemo(() => {
    return (users || []).filter((u) => {
      const r = String(u.role_id || u.role || '').toUpperCase();
      return r.includes('ADMIN') || r.includes('SUPER') || r === 'MANAGER';
    });
  }, [users]);

  const getAllocatedAdminForBranch = useCallback(
    (branch) => {
      if (!branch) return null;
      if (branch.allocated_admin) return branch.allocated_admin;
      const bId = branch.branch_id ?? branch.id;
      return (
        (users || []).find((u) => {
          const matchesBranch = String(u.branch_id || u.branch) === String(bId);
          const r = String(u.role_id || u.role || '').toUpperCase();
          const isAdminRole = r.includes('ADMIN') || r.includes('SUPER') || r === 'MANAGER';
          return matchesBranch && isAdminRole;
        }) || null
      );
    },
    [users]
  );

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
    deletingBranch, setDeletingBranch,

    // Users & Admin allocation
    users,
    adminUsers,
    getAllocatedAdminForBranch,
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