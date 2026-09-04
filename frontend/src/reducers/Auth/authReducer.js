import {
  AUTH_START,
  AUTH_SUCCESS,
  AUTH_FAILURE,
  AUTH_INITIALIZED,
  LOGOUT,
  UPDATE_LOGGED_IN_USER,
} from '../../constants/Auth/AuthConstants';

const initialState = {
  isAuthenticated: true, // Default active session for demonstration
  userRole: 'ADMIN',
  user: {
    serviceNo: 'ADM001',
    name: 'Edugate Admin',
    email: 'admin@edugate-global.com',
    role: 'ADMIN',
  },
  loading: false,
  initialized: true,
  error: null,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        userRole: action.payload.userRole,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case AUTH_INITIALIZED:
      return {
        ...state,
        initialized: true,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        userRole: null,
        user: null,
        loading: false,
        error: null,
      };
    case UPDATE_LOGGED_IN_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
