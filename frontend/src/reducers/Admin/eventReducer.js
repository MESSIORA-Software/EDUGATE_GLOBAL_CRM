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

const initialState = {
  list: [],
  loading: false,
  adding: false,
  updating: false,
  deleting: false,
  error: null,
};

export default function eventReducer(state = initialState, action) {
  switch (action.type) {
    // FETCH
    case EVENT_FETCH_START:
      return { ...state, loading: true, error: null };
    case EVENT_FETCH_SUCCESS:
      return { ...state, loading: false, list: action.payload, error: null };
    case EVENT_FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ADD
    case EVENT_ADD_START:
      return { ...state, adding: true, error: null };
    case EVENT_ADD_SUCCESS:
      return { ...state, adding: false, error: null };
    case EVENT_ADD_FAILURE:
      return { ...state, adding: false, error: action.payload };

    // UPDATE
    case EVENT_UPDATE_START:
      return { ...state, updating: true, error: null };
    case EVENT_UPDATE_SUCCESS:
      return { ...state, updating: false, error: null };
    case EVENT_UPDATE_FAILURE:
      return { ...state, updating: false, error: action.payload };

    // DELETE
    case EVENT_DELETE_START:
      return { ...state, deleting: true, error: null };
    case EVENT_DELETE_SUCCESS:
      return { ...state, deleting: false, error: null };
    case EVENT_DELETE_FAILURE:
      return { ...state, deleting: false, error: action.payload };

    default:
      return state;
  }
}
