import EventService from '../../services/Admin/eventService';
import {
  EVENT_FETCH_START,
  EVENT_FETCH_SUCCESS,
  EVENT_FETCH_FAILURE,

  EVENT_ADD_START,
  EVENT_ADD_SUCCESS,
  EVENT_ADD_FAILURE,

  EVENT_UPDATE_START,
  EVENT_UPDATE_SUCCESS,
  EVENT_UPDATE_FAILURE,

  EVENT_DELETE_START,
  EVENT_DELETE_SUCCESS,
  EVENT_DELETE_FAILURE,
} from '../../constants/Admin/eventConstants';

function extractError(err) {
  if (err.response) {
    return (
      err.response.data?.message ||
      err.response.data?.error ||
      `Server error (${err.response.status})`
    );
  } else if (err.request) {
    return 'No response from server. Check network connection.';
  }
  return err.message || 'Something went wrong.';
}

export const fetchEvents = () => {
  return async (dispatch) => {
    dispatch({ type: EVENT_FETCH_START });
    try {
      const response = await EventService.getAllEvents();
      const resBody = response.data;
      const list = Array.isArray(resBody?.data) ? resBody.data : [];

      dispatch({
        type: EVENT_FETCH_SUCCESS,
        payload: list,
      });
      return { success: true, data: list };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: EVENT_FETCH_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};

export const addEvent = (eventData) => {
  return async (dispatch) => {
    dispatch({ type: EVENT_ADD_START });
    try {
      const response = await EventService.createEvent(eventData);
      dispatch({
        type: EVENT_ADD_SUCCESS,
        payload: response.data?.data || eventData,
      });
      dispatch(fetchEvents());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({ type: EVENT_ADD_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const updateEvent = (eventId, eventData) => {
  return async (dispatch) => {
    if (!eventId) {
      const message = 'Event ID is required.';
      dispatch({ type: EVENT_UPDATE_FAILURE, payload: message });
      return { success: false, error: message };
    }

    dispatch({ type: EVENT_UPDATE_START });
    try {
      const response = await EventService.updateEvent(eventId, eventData);
      dispatch({
        type: EVENT_UPDATE_SUCCESS,
        payload: response.data?.data || { event_id: eventId, ...eventData },
      });
      dispatch(fetchEvents());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({ type: EVENT_UPDATE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const deleteEvent = (eventId) => {
  return async (dispatch) => {
    if (!eventId) {
      const message = 'Event ID is required.';
      dispatch({ type: EVENT_DELETE_FAILURE, payload: message });
      return { success: false, error: message };
    }

    dispatch({ type: EVENT_DELETE_START });
    try {
      await EventService.deleteEvent(eventId);
      dispatch({
        type: EVENT_DELETE_SUCCESS,
        payload: eventId,
      });
      dispatch(fetchEvents());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({ type: EVENT_DELETE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const getEventById = (eventId) => {
  return async () => {
    if (!eventId) {
      return { success: false, error: 'Event ID is required.' };
    }
    try {
      const response = await EventService.getEventById(eventId);
      const resData = response.data;
      const event = resData?.data || resData;

      if (!event) {
        return { success: false, error: `Event #${eventId} not found.` };
      }
      return { success: true, data: event };
    } catch (err) {
      return { success: false, error: extractError(err) };
    }
  };
};
