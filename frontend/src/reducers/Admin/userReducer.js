import {
  FETCH_USERS_START,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  FIND_USER_START,
  FIND_USER_SUCCESS,
  FIND_USER_FAILURE,
  USER_ADD_START,
  USER_ADD_SUCCESS,
  USER_ADD_FAILURE,
  USER_UPDATE_START,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAILURE,
  USER_DELETE_START,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAILURE,
  CLEAR_SELECTED_USER,
} from '../../constants/Admin/UserConstants';

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  submitting: false,
  error: null,
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_USERS_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload,
        error: null,
      };
    case FETCH_USERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FIND_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FIND_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedUser: action.payload,
        error: null,
      };
    case FIND_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case USER_ADD_START:
    case USER_UPDATE_START:
    case USER_DELETE_START:
      return {
        ...state,
        submitting: true,
        error: null,
      };

    case USER_ADD_SUCCESS:
      return {
        ...state,
        submitting: false,
        error: null,
      };

    case USER_UPDATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        error: null,
      };

    case USER_DELETE_SUCCESS:
      return {
        ...state,
        submitting: false,
        users: state.users.filter((u) => u.user_id !== action.payload && u.id !== action.payload),
        error: null,
      };

    case USER_ADD_FAILURE:
    case USER_UPDATE_FAILURE:
    case USER_DELETE_FAILURE:
      return {
        ...state,
        submitting: false,
        error: action.payload,
      };

    case CLEAR_SELECTED_USER:
      return {
        ...state,
        selectedUser: null,
      };

    default:
      return state;
  }
}
