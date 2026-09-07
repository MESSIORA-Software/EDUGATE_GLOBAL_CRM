import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  VIEW_PROFILE_START,
  VIEW_PROFILE_SUCCESS,
  VIEW_PROFILE_FAILURE,
  LOGOUT,
} from '../../constants/Auth/AuthConstants';

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialState = {
  token: localStorage.getItem('token') || null,
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_START:
    case VIEW_PROFILE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
      };

    case LOGIN_FAILURE:
    case VIEW_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case VIEW_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
      };

    case LOGOUT:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
}
