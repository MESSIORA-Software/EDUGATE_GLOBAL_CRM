import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import notificationService from '../../services/Notifications/notificationService';
import {
  NOTIFICATION_UNREAD_COUNT_SUCCESS,
  NOTIFICATION_FETCH_START,
  NOTIFICATION_FETCH_SUCCESS,
  NOTIFICATION_FETCH_FAILURE,
  NOTIFICATION_FETCH_MORE_START,
  NOTIFICATION_FETCH_MORE_SUCCESS,
  NOTIFICATION_FETCH_MORE_FAILURE,
  NOTIFICATION_MARK_READ_SUCCESS,
  NOTIFICATION_MARK_ALL_READ_SUCCESS,
} from '../../constants/Notifications/notificationConstants';

const POLL_INTERVAL_MS = 45000; 
let activePollerCount = 0;
let globalPollTimer = null;

export default function useNotifications(options = { autoPoll: true }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('token');

  const {
    unreadCount = 0,
    notifications = [],
    nextCursor = null,
    loading = false,
    loadingMore = false,
    error = null,
  } = useSelector((state) => state.notifications || {});

  const currentParamsRef = useRef({});

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationService.getUnreadCount(token);
      const count = Number(res?.data?.unread_count ?? 0);
      dispatch({
        type: NOTIFICATION_UNREAD_COUNT_SUCCESS,
        payload: count,
      });
      return count;
    } catch {
    }
  }, [token, dispatch]);

  const fetchNotifications = useCallback(
    async (params = {}) => {
      if (!token) return;
      currentParamsRef.current = params;
      dispatch({ type: NOTIFICATION_FETCH_START });
      try {
        const queryParams = {
          limit: 20,
          ...params,
        };
        const res = await notificationService.getNotifications(token, queryParams);
        dispatch({
          type: NOTIFICATION_FETCH_SUCCESS,
          payload: {
            data: res?.data || [],
            next_cursor: res?.next_cursor || null,
          },
        });
      } catch (err) {
        dispatch({
          type: NOTIFICATION_FETCH_FAILURE,
          payload: err.message || 'Failed to load notifications',
        });
      }
    },
    [token, dispatch]
  );

  const fetchMore = useCallback(
    async (params = {}) => {
      if (!token || !nextCursor || loadingMore) return;
      dispatch({ type: NOTIFICATION_FETCH_MORE_START });
      try {
        const mergedParams = {
          limit: 20,
          ...currentParamsRef.current,
          ...params,
          cursor: nextCursor,
        };
        const res = await notificationService.getNotifications(token, mergedParams);
        dispatch({
          type: NOTIFICATION_FETCH_MORE_SUCCESS,
          payload: {
            data: res?.data || [],
            next_cursor: res?.next_cursor || null,
          },
        });
      } catch (err) {
        dispatch({
          type: NOTIFICATION_FETCH_MORE_FAILURE,
          payload: err.message,
        });
      }
    },
    [token, nextCursor, loadingMore, dispatch]
  );

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token || !notificationId) return;

      dispatch({
        type: NOTIFICATION_MARK_READ_SUCCESS,
        payload: notificationId,
      });

      try {
        await notificationService.markAsRead(token, notificationId);
      } catch {
        fetchUnreadCount();
      }
    },
    [token, dispatch, fetchUnreadCount]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    dispatch({
      type: NOTIFICATION_MARK_ALL_READ_SUCCESS,
    });

    try {
      await notificationService.markAllAsRead(token);
    } catch {
      fetchUnreadCount();
      fetchNotifications(currentParamsRef.current);
    }
  }, [token, dispatch, fetchUnreadCount, fetchNotifications]);

  useEffect(() => {
    if (!token || !options.autoPoll) return;

    fetchUnreadCount();

    activePollerCount++;
    if (!globalPollTimer) {
      globalPollTimer = setInterval(() => {
        fetchUnreadCount();
      }, POLL_INTERVAL_MS);
    }

    return () => {
      activePollerCount--;
      if (activePollerCount <= 0 && globalPollTimer) {
        clearInterval(globalPollTimer);
        globalPollTimer = null;
        activePollerCount = 0;
      }
    };
  }, [token, fetchUnreadCount, options.autoPoll]);

  return {
    unreadCount,
    notifications,
    nextCursor,
    loading,
    loadingMore,
    error,
    fetchUnreadCount,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
  };
}
