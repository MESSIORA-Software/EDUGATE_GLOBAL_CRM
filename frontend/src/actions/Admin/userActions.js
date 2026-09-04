import userService from '../../services/Admin/userService';
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

export const fetchUsers = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_USERS_START });
    try {
      const response = await userService.getAllUsers();
      const users = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.users)
        ? response.users
        : [];
      dispatch({ type: FETCH_USERS_SUCCESS, payload: users });
      return { success: true, data: users };
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch users list.';
      console.error('Fetch users error:', errorMsg);
      dispatch({ type: FETCH_USERS_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const findUserById = (userId) => {
  return async (dispatch) => {
    if (!userId) {
      const msg = 'User ID is required to search.';
      dispatch({ type: FIND_USER_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: FIND_USER_START });
    try {
      const response = await userService.getUserById(userId);
      const userData = response?.data || response;
      dispatch({ type: FIND_USER_SUCCESS, payload: userData });
      return { success: true, data: userData };
    } catch (err) {
      const errorMsg = err.message || `Failed to find user: ${userId}`;
      console.error('Find user error:', errorMsg);
      dispatch({ type: FIND_USER_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const registerUser = (userData) => {
  return async (dispatch) => {
    if (!userData.name || !userData.email) {
      const msg = 'User name and email are required.';
      dispatch({ type: USER_ADD_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: USER_ADD_START });
    try {
      const response = await userService.createUser(userData);
      const newUser = response?.data || { ...userData, user_id: response?.user_id || response?.id };
      dispatch({ type: USER_ADD_SUCCESS, payload: newUser });
      dispatch(fetchUsers());
      return { success: true, data: newUser };
    } catch (err) {
      const errorMsg = err.message || 'Failed to create user.';
      console.error('Create user error:', errorMsg);
      dispatch({ type: USER_ADD_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const updateUser = (userData) => {
  return async (dispatch) => {
    if (!userData.user_id || !userData.name) {
      const msg = 'User ID and name are required for update.';
      dispatch({ type: USER_UPDATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: USER_UPDATE_START });
    try {
      const response = await userService.updateUser(userData);
      const updatedUser = response?.data || userData;
      dispatch({ type: USER_UPDATE_SUCCESS, payload: updatedUser });
      dispatch(fetchUsers());
      return { success: true, data: updatedUser };
    } catch (err) {
      const errorMsg = err.message || 'Failed to update user.';
      console.error('Update user error:', errorMsg);
      dispatch({ type: USER_UPDATE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const deleteUser = (userId) => {
  return async (dispatch) => {
    if (!userId) {
      const msg = 'User ID is required to delete.';
      dispatch({ type: USER_DELETE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: USER_DELETE_START });
    try {
      await userService.deleteUser(userId);
      dispatch({ type: USER_DELETE_SUCCESS, payload: userId });
      dispatch(fetchUsers());
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete user.';
      console.error('Delete user error:', errorMsg);
      dispatch({ type: USER_DELETE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const clearSelectedUser = () => ({
  type: CLEAR_SELECTED_USER,
});
