import {
  CLIENT_FETCH_START,
  CLIENT_FETCH_SUCCESS,
  CLIENT_FETCH_FAILURE,

  CLIENT_ADD_START,
  CLIENT_ADD_SUCCESS,
  CLIENT_ADD_FAILURE,

  CLIENT_UPDATE_START,
  CLIENT_UPDATE_SUCCESS,
  CLIENT_UPDATE_FAILURE,

  CLIENT_DELETE_START,
  CLIENT_DELETE_SUCCESS,
  CLIENT_DELETE_FAILURE,
} from '../../constants/Admin/clientConstants';

const initialState = {
  list: [],
  loading: false,
  adding: false,
  updating: false,
  deleting: false,
  error: null,
};

export default function clientReducer(state = initialState, action) {
  switch (action.type) {
    // FETCH
    case CLIENT_FETCH_START:
      return { ...state, loading: true, error: null };
    case CLIENT_FETCH_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case CLIENT_FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ADD
    case CLIENT_ADD_START:
      return { ...state, adding: true, error: null };
    case CLIENT_ADD_SUCCESS:
      return { ...state, adding: false };
    case CLIENT_ADD_FAILURE:
      return { ...state, adding: false, error: action.payload };

    // UPDATE
    case CLIENT_UPDATE_START:
      return { ...state, updating: true, error: null };
    case CLIENT_UPDATE_SUCCESS:
      return { ...state, updating: false };
    case CLIENT_UPDATE_FAILURE:
      return { ...state, updating: false, error: action.payload };

    // DELETE
    case CLIENT_DELETE_START:
      return { ...state, deleting: true, error: null };
    case CLIENT_DELETE_SUCCESS:
      return { ...state, deleting: false };
    case CLIENT_DELETE_FAILURE:
      return { ...state, deleting: false, error: action.payload };

    default:
      return state;
  }
}
