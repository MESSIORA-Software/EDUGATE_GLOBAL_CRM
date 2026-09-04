import authService from '../../services/Auth/authService';
import {
  AUTH_START,
  AUTH_SUCCESS,
  AUTH_FAILURE,
  AUTH_INITIALIZED,
  LOGOUT,
  UPDATE_LOGGED_IN_USER,
} from '../../constants/Auth/AuthConstants';

export const loginStart = () => ({ type: AUTH_START });
export const loginSuccess = (userRole, user) => ({
  type: AUTH_SUCCESS,
  payload: { userRole, user },
});
export const loginFailure = (errorMsg) => ({
  type: AUTH_FAILURE,
  payload: errorMsg,
});
export const logoutUser = () => ({ type: LOGOUT });
export const authInitialized = () => ({ type: AUTH_INITIALIZED });

export const initializeAuth = () => {
  return (dispatch) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      if (storedUser && userRole) {
        dispatch(loginSuccess(userRole, JSON.parse(storedUser)));
      }
    } catch (err) {
      console.warn('Failed to load local storage auth state:', err);
    } finally {
      dispatch(authInitialized());
    }
  };
};

export const authenticate = (serviceNo, password) => {
  return async (dispatch) => {
    if (!serviceNo || !password) {
      dispatch(loginFailure('Please enter credentials.'));
      return { success: false, error: 'Please enter credentials.' };
    }

    dispatch(loginStart());

    try {
      const loginRes = await authService.login(serviceNo, password);
      const userProfile = loginRes.user || { serviceNo, name: 'Admin User', role: 'ADMIN' };
      const userRole = (userProfile.role || 'ADMIN').toUpperCase();

      localStorage.setItem('user', JSON.stringify(userProfile));
      localStorage.setItem('userRole', userRole);

      dispatch(loginSuccess(userRole, userProfile));
      return { success: true, user: userProfile };
    } catch (err) {
      const msg = err.message || 'Login failed.';
      dispatch(loginFailure(msg));
      return { success: false, error: msg };
    }
  };
};

export const logout = () => {
  return (dispatch) => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
    } catch (err) {
      console.warn('Failed to clear localStorage on logout:', err);
    }
    dispatch(logoutUser());
  };
};

export const updateLoggedInUser = (updatedFields) => {
  return (dispatch, getState) => {
    const currentUser = getState()?.auth?.user || {};
    const mergedUser = { ...currentUser, ...updatedFields };
    try {
      localStorage.setItem('user', JSON.stringify(mergedUser));
    } catch (err) {
      console.warn('Failed to persist user update:', err);
    }
    dispatch({ type: UPDATE_LOGGED_IN_USER, payload: updatedFields });
  };
};
