import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getEventById,
} from '../../../actions/Admin/eventAction';
export const formatEventId = (id) => {
  if (id === null || id === undefined || id === '') return '';
  const cleanId = String(id).replace(/^EDG-?/i, '').replace(/^#/, '').trim();
  const num = parseInt(cleanId, 10);
  return isNaN(num) ? String(id) : `EDG-${String(num).padStart(4, '0')}`;
};

export const parseEventId = (input) => {
  if (!input) return '';
  const cleaned = String(input).replace(/^EDG-?/i, '').replace(/^#/, '').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? cleaned : String(num);
};

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
    const rawInput = findIdInput.trim();
    if (!rawInput) return;

    setIsFinding(true);
    const numericId = parseEventId(rawInput);
    const res = await dispatch(getEventById(numericId));
    setIsFinding(false);

    if (res?.success && res.data) {
      setDetailEvent(res.data);
      showToast(`Event ${formatEventId(res.data.event_id || rawInput)} found!`);
    } else {
      showToast(res?.error || `Event ${formatEventId(rawInput)} not found`, 'error');
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

  const handleDeleteEvent = async (eventId) => {
    const res = await dispatch(deleteEvent(eventId));
    if (res?.success) {
      showToast('Event deleted successfully!');
    } else {
      showToast(res?.error || 'Failed to delete Event', 'error');
    }
    return res;
  };

  const totalCount = events.length;

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by general search query (title / reason / keyword)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((e) =>
        String(e?.event_id ?? '').includes(q) ||
        formatEventId(e?.event_id).toLowerCase().includes(q) ||
        (e?.title   ?? '').toLowerCase().includes(q) ||
        (e?.reason  ?? '').toLowerCase().includes(q)
      );
    }

    // Filter by ID search input in real time as the user types
    if (findIdInput.trim()) {
      const idQuery = findIdInput.toLowerCase().trim();
      const pureNum = parseEventId(idQuery);
      result = result.filter((e) => {
        const rawId = String(e?.event_id ?? '');
        const formatted = formatEventId(e?.event_id).toLowerCase();
        return (
          rawId === pureNum ||
          rawId.includes(idQuery) ||
          formatted.includes(idQuery)
        );
      });
    }

    return result;
  }, [events, searchTerm, findIdInput]);

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
