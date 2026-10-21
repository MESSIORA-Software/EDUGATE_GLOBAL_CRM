import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPipelineData, moveOpportunityStatus } from '../../../actions/Admin/pipelineAction';
import useAuth from '../../Auth/useAuth';
import { getUserRole } from '../../../utils/roleUtils';

export default function usePipeline() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  const {
    statuses = [],
    clients = [],
    opportunities = [],
    loading: apiLoading = false,
    movingStudent = false,
    error = null,
  } = useSelector((state) => state.pipeline ?? {});

  const baseOpportunities = useMemo(() => {
    if (isSuperAdmin) return opportunities;
    return opportunities.filter((opp) => Number(opp.assigned_staff_id) === Number(user?.user_id));
  }, [opportunities, isSuperAdmin, user?.user_id]);

  // Local filtering state
  const [searchTerm, setSearchTerm]         = useState('');
  const [programFilter, setProgramFilter]   = useState('All');
  const [focusedStatusId, setFocusedStatusId] = useState(null); // When set, only shows this status's column

  // Drag and Drop state
  const [draggedOpportunity, setDraggedOpportunity] = useState(null);
  const [dragOverStatusId, setDragOverStatusId]     = useState(null);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen]         = useState(false);
  const [isManagePipelineOpen, setIsManagePipelineOpen] = useState(false);
  const [isCreateOppOpen, setIsCreateOppOpen]           = useState(false);
  const [detailStudent, setDetailStudent]               = useState(null);
  const [editingStudent, setEditingStudent]             = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch pipeline data on mount
  useEffect(() => {
    dispatch(fetchPipelineData());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchPipelineData());
    showToast('Pipeline refreshed with latest opportunities & statuses');
  }, [dispatch, showToast]);

  // Handle Drag Start
  const handleDragStart = (e, opportunity) => {
    setDraggedOpportunity(opportunity);
    try {
      e.dataTransfer.setData('text/plain', String(opportunity.opportunity_id));
      e.dataTransfer.effectAllowed = 'move';
    } catch {
      // Fallback
    }
  };

  // Handle Drag Over
  const handleDragOver = (e, statusId) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverStatusId !== statusId) {
      setDragOverStatusId(statusId);
    }
  };

  // Handle Drag Leave
  const handleDragLeave = (e, statusId) => {
    if (dragOverStatusId === statusId) {
      setDragOverStatusId(null);
    }
  };

  // Handle Drop
  const handleDrop = async (e, targetStatusId) => {
    e.preventDefault();
    setDragOverStatusId(null);

    let oppIdStr = '';
    try {
      oppIdStr = e.dataTransfer.getData('text/plain');
    } catch {
      oppIdStr = '';
    }

    const oppId = oppIdStr ? Number(oppIdStr) : draggedOpportunity?.opportunity_id;
    const opp = draggedOpportunity || opportunities.find((o) => o.opportunity_id === oppId);
    setDraggedOpportunity(null);

    if (!opp || !targetStatusId) return;
    if (opp.status_id === targetStatusId) return;

    const targetStatus = statuses.find((s) => s.status_id === targetStatusId);
    const res = await dispatch(moveOpportunityStatus(opp.opportunity_id, opp.client_id, targetStatusId));

    if (res?.success) {
      const studentName = opp.client?.name || `Student #${opp.client_id}`;
      const statusTitle = targetStatus?.status_name || 'new stage';
      showToast(`Moved "${studentName}" to ${statusTitle}!`);
    } else {
      showToast(res?.error || 'Failed to update opportunity status', 'error');
    }
  };

  // Move directly via action menu
  const handleMoveOpportunity = async (opportunity, targetStatusId) => {
    if (opportunity.status_id === targetStatusId) return;

    const targetStatus = statuses.find((s) => s.status_id === targetStatusId);
    const res = await dispatch(
      moveOpportunityStatus(opportunity.opportunity_id, opportunity.client_id, targetStatusId)
    );

    if (res?.success) {
      const studentName = opportunity.client?.name || `Student #${opportunity.client_id}`;
      const statusTitle = targetStatus?.status_name || 'new stage';
      showToast(`Moved "${studentName}" to ${statusTitle}!`);
    } else {
      showToast(res?.error || 'Failed to update opportunity status', 'error');
    }
  };

  // Unique program/courses or sources list from opportunities
  const programOptions = useMemo(() => {
    const set = new Set();
    baseOpportunities.forEach((opp) => {
      const src = opp.client?.source;
      if (src) set.add(src);
    });
    return Array.from(set);
  }, [baseOpportunities]);

  // Group ONLY created opportunities by status (respecting focused status if set)
  const columnsData = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    // If a specific status is focused ("View All" clicked for that column), only display that column
    const activeStatuses = focusedStatusId
      ? statuses.filter((s) => s.status_id === focusedStatusId)
      : statuses;

    return activeStatuses.map((status) => {
      const statusOpps = baseOpportunities.filter((opp) => opp.status_id === status.status_id);

      const filtered = statusOpps.filter((opp) => {
        const client = opp.client || {};
        const cId = String(opp.client_id || client.client_id || '');
        const oppId = String(opp.opportunity_id || '');
        const name = (client.name || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        const src = (client.source || '').toLowerCase();

        const matchesSearch =
          !search ||
          name.includes(search) ||
          email.includes(search) ||
          src.includes(search) ||
          cId.includes(search) ||
          oppId.includes(search);

        const matchesProgram =
          programFilter === 'All' || client.source === programFilter;

        return matchesSearch && matchesProgram;
      });

      return {
        status,
        opportunities: filtered,
        count: filtered.length,
      };
    });
  }, [statuses, baseOpportunities, searchTerm, programFilter, focusedStatusId]);

  return {
    statuses,
    clients,
    opportunities: baseOpportunities,
    columnsData,
    apiLoading,
    movingStudent,
    error,

    searchTerm,
    setSearchTerm,
    programFilter,
    setProgramFilter,
    programOptions,

    focusedStatusId,
    setFocusedStatusId,

    draggedOpportunity,
    dragOverStatusId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleMoveOpportunity,

    isAddStudentOpen,
    setIsAddStudentOpen,
    isManagePipelineOpen,
    setIsManagePipelineOpen,
    isCreateOppOpen,
    setIsCreateOppOpen,
    detailStudent,
    setDetailStudent,
    editingStudent,
    setEditingStudent,

    toast,
    showToast,
    handleRefresh,
  };
}
