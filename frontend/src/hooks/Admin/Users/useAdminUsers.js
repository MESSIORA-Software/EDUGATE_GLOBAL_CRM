import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  findUserById,
  deleteUser,
} from '../../../actions/Admin/userActions';
import { fetchRoles } from '../../../actions/Admin/roleActions';
import { fetchBranches } from '../../../actions/Admin/branchAction';

export default function useAdminUsers() {
  const dispatch = useDispatch();
  const { users: usersList, loading: apiLoading, submitting, error } = useSelector(
    (state) => state.users
  );
  const { roles = [] } = useSelector((state) => state.roles ?? {});
  const { list: branches = [] } = useSelector((state) => state.branch ?? {});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [findIdInput, setFindIdInput] = useState('');
  const [isFinding, setIsFinding] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Toast alert
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchBranches());
  }, [dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRefresh = () => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchBranches());
    showToast('Users list refreshed');
  };

  const handleFindById = async (e) => {
    e?.preventDefault();
    if (!findIdInput.trim()) return;

    setIsFinding(true);
    const res = await dispatch(findUserById(findIdInput.trim()));
    setIsFinding(false);

    if (res.success) {
      setDetailUser(res.data);
      showToast(`User '${findIdInput}' found!`);
    } else {
      showToast(res.error || `User '${findIdInput}' not found`, 'error');
    }
  };

  const handleDelete = (user) => {
    setDeletingUser(user);
  };

  const handleDeleteUser = async (userId) => {
    const res = await dispatch(deleteUser(userId));
    if (res.success) {
      showToast(`User deleted successfully!`);
      setDeletingUser(null);
      return { success: true };
    } else {
      showToast(res.error || 'Failed to delete user', 'error');
      return { success: false, error: res.error };
    }
  };

  const totalCount = usersList?.length || 0;
  const activeCount = usersList?.filter((u) => u.status === 'ACTIVE' || u.status === 'Active')?.length || 0;

  const filteredUsers = useMemo(() => {
    let list = Array.isArray(usersList) ? [...usersList] : [];

    // Map role and branch names if missing
    list = list.map((u) => {
      const matchedRole = roles.find(
        (r) => String(r.role_id) === String(u.role_id) || String(r.id) === String(u.role_id)
      );
      const matchedBranch = branches.find(
        (b) => String(b.branch_id) === String(u.branch_id) || String(b.id) === String(u.branch_id)
      );
      return {
        ...u,
        role_name: u.role_name || matchedRole?.role_name || matchedRole?.name || u.role_id || 'Staff',
        branch_name: u.branch_name || matchedBranch?.branch_name || matchedBranch?.name || 'Main Office',
      };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.role_name && u.role_name.toLowerCase().includes(q)) ||
          (u.branch_name && u.branch_name.toLowerCase().includes(q)) ||
          (u.user_id && String(u.user_id).toLowerCase().includes(q))
      );
    }

    if (selectedStatus !== 'All') {
      list = list.filter((u) => (u.status || '').toUpperCase() === selectedStatus.toUpperCase());
    }

    return list;
  }, [usersList, roles, branches, searchQuery, selectedStatus]);

  return {
    usersList,
    filteredUsers,
    apiLoading,
    submitting,
    error,
    totalCount,
    activeCount,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    findIdInput,
    setFindIdInput,
    isFinding,
    isAddOpen,
    setIsAddOpen,
    editingUser,
    setEditingUser,
    detailUser,
    setDetailUser,
    deletingUser,
    setDeletingUser,
    toast,
    showToast,
    handleRefresh,
    handleFindById,
    handleDelete,
    handleDeleteUser,
  };
}
