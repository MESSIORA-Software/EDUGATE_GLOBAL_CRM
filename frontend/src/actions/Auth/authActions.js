import authService from '../../services/Auth/authService';
import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  VIEW_PROFILE_START,
  VIEW_PROFILE_SUCCESS,
  VIEW_PROFILE_FAILURE,
  LOGOUT,
} from '../../constants/Auth/AuthConstants';

export const login = (email, password) => {
  return async (dispatch) => {
    if (!email || !password) {
      const errorMsg = 'Email and password are required.';
      dispatch({ type: LOGIN_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }

    dispatch({ type: LOGIN_START });

    try {
      const response = await authService.login(email, password);
      const token = response?.token || response?.data?.token || response?.accessToken;
      let user = response?.user || response?.data?.user || response?.data || null;

      if (token) {
        localStorage.setItem('token', token);

        // Fetch user profile if not fully provided in login response
        if (!user || typeof user !== 'object') {
          try {
            const profileRes = await authService.viewMyProfile(token);
            user = profileRes?.data || profileRes?.user || profileRes;
          } catch {
            // Keep user as null or partial if viewMyProfile fails
          }
        }
      }

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: { token, user },
      });

      return { success: true, token, user };
    } catch (err) {
      const errorMsg = err.message || 'Login failed.';
      dispatch({ type: LOGIN_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const viewMyProfile = (token) => {
  return async (dispatch) => {
    dispatch({ type: VIEW_PROFILE_START });

    try {
      const response = await authService.viewMyProfile(token);
      const user = response?.data || response?.user || response;

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      dispatch({
        type: VIEW_PROFILE_SUCCESS,
        payload: user,
      });

      return { success: true, data: user };
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch user profile.';
      dispatch({ type: VIEW_PROFILE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const logout = () => {
  return (dispatch) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: LOGOUT });
  };
};
