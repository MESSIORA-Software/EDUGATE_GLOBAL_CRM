import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoles,
  findRoleById,
  deleteRole,
} from '../../../actions/Admin/roleActions';

export default function useAdminRoles() {
  const dispatch = useDispatch();
  const { roles: rolesList, loading: apiLoading, submitting, error } = useSelector(
    (state) => state.roles
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [findIdInput, setFindIdInput] = useState('');
  const [isFinding, setIsFinding] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [detailRole, setDetailRole] = useState(null);

  // Toast alert
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRefresh = () => {
    dispatch(fetchRoles());
    showToast('Roles list refreshed');
  };

  const handleFindById = async (e) => {
    e?.preventDefault();
    if (!findIdInput.trim()) return;

    setIsFinding(true);
    const res = await dispatch(findRoleById(findIdInput.trim().toUpperCase()));
    setIsFinding(false);

    if (res.success) {
      setDetailRole(res.data);
      showToast(`Role '${findIdInput.toUpperCase()}' found!`);
    } else {
      showToast(res.error || `Role '${findIdInput}' not found`, 'error');
    }
  };

  const handleDelete = async (roleId) => {
    if (window.confirm(`Are you sure you want to delete role '${roleId}'?`)) {
      const res = await dispatch(deleteRole(roleId));
      if (res.success) {
        showToast(`Role '${roleId}' deleted successfully!`);
      } else {
        showToast(res.error || `Failed to delete role '${roleId}'`, 'error');
      }
    }
  };

  const totalCount = rolesList?.length || 0;

  const filteredRoles = useMemo(() => {
    let list = Array.isArray(rolesList) ? [...rolesList] : [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((r) => {
        const id = (r?.role_id || '').toLowerCase();
        const name = (r?.role_name || '').toLowerCase();
        return id.includes(q) || name.includes(q);
      });
    }

    return list;
  }, [rolesList, searchTerm]);

  return {
    rolesList,
    filteredRoles,
    apiLoading,
    submitting,
    error,
    totalCount,
    searchTerm,
    setSearchTerm,
    findIdInput,
    setFindIdInput,
    isFinding,
    isAddOpen,
    setIsAddOpen,
    editingRole,
    setEditingRole,
    detailRole,
    setDetailRole,
    toast,
    showToast,
    handleRefresh,
    handleFindById,
    handleDelete,
  };
}
