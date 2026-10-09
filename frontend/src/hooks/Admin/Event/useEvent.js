import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getEventById,
} from '../../../actions/Admin/eventAction';

export default function useEvent() {
  const dispatch = useDispatch();

  const {
    list: events = [],
    loading: apiLoading = false,
    adding = false,
    updating = false,
    deleting = false,
    error = null,
  } = useSelector((state) => state.event ?? {});

  const submitting = adding || updating || deleting;

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [findIdInput, setFindIdInput] = useState('');
  const [isFinding, setIsFinding] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen]         = useState(false);
  const [editingEvent, setEditingEvent]   = useState(null);
  const [detailEvent, setDetailEvent]     = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Load on mount
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchEvents());
    showToast('Calendar events refreshed');
  }, [dispatch, showToast]);

  const handleFindById = async (e) => {
    e?.preventDefault();
    const id = findIdInput.trim();
    if (!id) return;

    setIsFinding(true);
    const res = await dispatch(getEventById(id));
    setIsFinding(false);

    if (res?.success && res.data) {
      setDetailEvent(res.data);
      showToast(`Event #${id} found!`);
    } else {
      showToast(res?.error || `Event #${id} not found`, 'error');
    }
  };

  const handleAddEvent = async (eventData) => {
    const res = await dispatch(addEvent(eventData));
    if (res?.success) {
      showToast(`Event "${eventData.title}" created successfully!`);
      setIsAddOpen(false);
    } else {
      showToast(res?.error || 'Failed to create event', 'error');
    }
    return res;
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    const res = await dispatch(updateEvent(eventId, eventData));
    if (res?.success) {
      showToast(`Event updated successfully!`);
      setEditingEvent(null);
    } else {
      showToast(res?.error || 'Failed to update event', 'error');
    }
    return res;
  };

  const handleDeleteEvent = async (eventId, eventTitle = '') => {
    const label = eventTitle ? `"${eventTitle}"` : `Event #${eventId}`;
    if (!window.confirm(`Are you sure you want to delete ${label}?`)) {
      return { success: false };
    }
    const res = await dispatch(deleteEvent(eventId));
    if (res?.success) {
      showToast(`Event deleted successfully!`);
    } else {
      showToast(res?.error || `Failed to delete Event`, 'error');
    }
    return res;
  };

  const totalCount = events.length;

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return [...events];
    const q = searchTerm.toLowerCase().trim();
    return events.filter((e) =>
      String(e?.event_id ?? '').includes(q) ||
      (e?.title   ?? '').toLowerCase().includes(q) ||
      (e?.reason  ?? '').toLowerCase().includes(q)
    );
  }, [events, searchTerm]);

  return {
    events,
    filteredEvents,
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
    editingEvent,  setEditingEvent,
    detailEvent,   setDetailEvent,

    toast,
    showToast,

    handleAddEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleRefresh,
  };
}
