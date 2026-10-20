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

const initialState = {
  unreadCount: 0,
  notifications: [],
  nextCursor: null,
  loading: false,
  loadingMore: false,
  error: null,
};

export default function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATION_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        unreadCount: Math.max(0, action.payload),
      };

    case NOTIFICATION_FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case NOTIFICATION_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.data || [],
        nextCursor: action.payload.next_cursor || null,
        error: null,
      };

    case NOTIFICATION_FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case NOTIFICATION_FETCH_MORE_START:
      return {
        ...state,
        loadingMore: true,
      };

    case NOTIFICATION_FETCH_MORE_SUCCESS: {
      const incoming = action.payload.data || [];
      const existingIds = new Set(state.notifications.map((n) => n.notification_id));
      const deduped = incoming.filter((n) => !existingIds.has(n.notification_id));
      return {
        ...state,
        loadingMore: false,
        notifications: [...state.notifications, ...deduped],
        nextCursor: action.payload.next_cursor || null,
      };
    }

    case NOTIFICATION_FETCH_MORE_FAILURE:
      return {
        ...state,
        loadingMore: false,
      };

    case NOTIFICATION_MARK_READ_SUCCESS: {
      const targetId = action.payload;
      let wasUnread = false;
      const updatedList = state.notifications.map((item) => {
        if (item.notification_id === targetId) {
          if (!item.is_read) wasUnread = true;
          return {
            ...item,
            is_read: true,
            read_at: item.read_at || new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...state,
        notifications: updatedList,
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }

    case NOTIFICATION_MARK_ALL_READ_SUCCESS: {
      const now = new Date().toISOString();
      const updatedList = state.notifications.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at || now,
      }));
      return {
        ...state,
        notifications: updatedList,
        unreadCount: 0,
      };
    }

    default:
      return state;
  }
}
