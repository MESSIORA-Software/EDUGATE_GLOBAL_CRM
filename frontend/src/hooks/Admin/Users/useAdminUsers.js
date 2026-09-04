import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  findUserById,
  deleteUser,
} from '../../../actions/Admin/userActions';

export default function useAdminUsers() {
  const dispatch = useDispatch();
  const { users: usersList, loading: apiLoading, submitting, error } = useSelector(
    (state) => state.users
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [findIdInput, setFindIdInput] = useState('');
  const [isFinding, setIsFinding] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);

  // Toast alert
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRefresh = () => {
    dispatch(fetchUsers());
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

  const handleDelete = async (userId) => {
    if (window.confirm(`Are you sure you want to delete user '${userId}'?`)) {
      const res = await dispatch(deleteUser(userId));
      if (res.success) {
        showToast(`User deleted successfully!`);
      } else {
        showToast(res.error || 'Failed to delete user', 'error');
      }
    }
  };

  const totalCount = usersList?.length || 0;
  const activeCount = usersList?.filter((u) => u.status === 'ACTIVE' || u.status === 'Active')?.length || 0;

  const filteredUsers = useMemo(() => {
    let list = Array.isArray(usersList) ? [...usersList] : [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.user_id && String(u.user_id).toLowerCase().includes(q))
      );
    }

    if (selectedStatus !== 'All') {
      list = list.filter((u) => (u.status || '').toUpperCase() === selectedStatus.toUpperCase());
    }

    return list;
  }, [usersList, searchQuery, selectedStatus]);

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
    toast,
    showToast,
    handleRefresh,
    handleFindById,
    handleDelete,
  };
}
