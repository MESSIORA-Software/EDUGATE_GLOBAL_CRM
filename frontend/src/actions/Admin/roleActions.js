import roleService from '../../services/Admin/roleService';
import {
  FETCH_ROLES_START,
  FETCH_ROLES_SUCCESS,
  FETCH_ROLES_FAILURE,
  FIND_ROLE_START,
  FIND_ROLE_SUCCESS,
  FIND_ROLE_FAILURE,
  ROLE_ADD_START,
  ROLE_ADD_SUCCESS,
  ROLE_ADD_FAILURE,
  ROLE_UPDATE_START,
  ROLE_UPDATE_SUCCESS,
  ROLE_UPDATE_FAILURE,
  ROLE_DELETE_START,
  ROLE_DELETE_SUCCESS,
  ROLE_DELETE_FAILURE,
  CLEAR_SELECTED_ROLE,
} from '../../constants/Admin/RoleConstants';

export const fetchRoles = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_ROLES_START });
    try {
      const response = await roleService.getAllRoles();
      const roles = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.roles)
        ? response.roles
        : [];
      dispatch({ type: FETCH_ROLES_SUCCESS, payload: roles });
      return { success: true, data: roles };
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch roles.';
      console.error('Fetch roles error:', errorMsg);
      dispatch({ type: FETCH_ROLES_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const findRoleById = (roleId) => {
  return async (dispatch) => {
    if (!roleId) {
      const msg = 'Role ID is required to search.';
      dispatch({ type: FIND_ROLE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: FIND_ROLE_START });
    try {
      const response = await roleService.getRoleById(roleId);
      const roleData = response?.data || response;
      dispatch({ type: FIND_ROLE_SUCCESS, payload: roleData });
      return { success: true, data: roleData };
    } catch (err) {
      const errorMsg = err.message || `Failed to find role: ${roleId}`;
      console.error('Find role error:', errorMsg);
      dispatch({ type: FIND_ROLE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const createRole = (roleId, roleName) => {
  return async (dispatch) => {
    if (!roleId || !roleName) {
      const msg = 'Both Role ID and Role Name are required.';
      dispatch({ type: ROLE_ADD_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: ROLE_ADD_START });
    try {
      const response = await roleService.createRole(roleId, roleName);
      const newRole = { role_id: roleId, role_name: roleName, ...response?.data };
      dispatch({ type: ROLE_ADD_SUCCESS, payload: newRole });
      dispatch(fetchRoles());
      return { success: true, data: newRole };
    } catch (err) {
      const errorMsg = err.message || 'Failed to create role.';
      console.error('Create role error:', errorMsg);
      dispatch({ type: ROLE_ADD_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const updateRole = (roleId, roleName) => {
  return async (dispatch) => {
    if (!roleId || !roleName) {
      const msg = 'Both Role ID and Role Name are required.';
      dispatch({ type: ROLE_UPDATE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: ROLE_UPDATE_START });
    try {
      const response = await roleService.updateRole(roleId, roleName);
      const updatedRole = { role_id: roleId, role_name: roleName, ...response?.data };
      dispatch({ type: ROLE_UPDATE_SUCCESS, payload: updatedRole });
      dispatch(fetchRoles());
      return { success: true, data: updatedRole };
    } catch (err) {
      const errorMsg = err.message || 'Failed to update role.';
      console.error('Update role error:', errorMsg);
      dispatch({ type: ROLE_UPDATE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const deleteRole = (roleId) => {
  return async (dispatch) => {
    if (!roleId) {
      const msg = 'Role ID is required to delete.';
      dispatch({ type: ROLE_DELETE_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: ROLE_DELETE_START });
    try {
      await roleService.deleteRole(roleId);
      dispatch({ type: ROLE_DELETE_SUCCESS, payload: roleId });
      dispatch(fetchRoles());
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete role.';
      console.error('Delete role error:', errorMsg);
      dispatch({ type: ROLE_DELETE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

export const clearSelectedRole = () => ({
  type: CLEAR_SELECTED_ROLE,
});
