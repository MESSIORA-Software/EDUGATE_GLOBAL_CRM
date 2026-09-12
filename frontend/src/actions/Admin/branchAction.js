import BranchService from '../../services/Admin/branchService';

import {
  BRANCH_FETCH_START,
  BRANCH_FETCH_SUCCESS,
  BRANCH_FETCH_FAILURE,

  BRANCH_ADD_START,
  BRANCH_ADD_SUCCESS,
  BRANCH_ADD_FAILURE,

  BRANCH_UPDATE_START,
  BRANCH_UPDATE_SUCCESS,
  BRANCH_UPDATE_FAILURE,

  BRANCH_DELETE_START,
  BRANCH_DELETE_SUCCESS,
  BRANCH_DELETE_FAILURE,

  BRANCH_USERS_FETCH_START,
  BRANCH_USERS_FETCH_SUCCESS,
  BRANCH_USERS_FETCH_FAILURE,
} from '../../constants/Admin/branchConstants';


// ============================================================
// ERROR HANDLER
// ============================================================

function logAndExtractError(label, err) {
  console.warn(`${label} — request failed`);

  if (err.response) {
    // Server responded with an error
    console.warn(`${label} — status:`, err.response.status);

    console.warn(
      `${label} — response body:`,
      JSON.stringify(err.response.data)
    );

    console.warn(`${label} — request URL:`, err.config?.url);

    console.warn(
      `${label} — request payload:`,
      JSON.stringify(err.config?.data)
    );

    return (
      err.response.data?.message ||
      err.response.data?.error ||
      (typeof err.response.data === 'string'
        ? err.response.data
        : null) ||
      `Server returned ${err.response.status}`
    );
  } else if (err.request) {
    // Request was sent but no response received
    console.warn(
      `${label} — no response received. Check API URL and network connection.`
    );

    console.warn(`${label} — request URL:`, err.config?.url);

    return 'No response from server — check your network connection and API URL.';
  }

  // Something went wrong while setting up request
  console.warn(`${label} — setup error:`, err.message);

  return err.message || 'Something went wrong.';
}


// ============================================================
// FETCH ALL BRANCHES
// ============================================================

export const fetchBranches = () => {
  return async (dispatch) => {
    dispatch({ type: BRANCH_FETCH_START });

    try {
      const response = await BranchService.getBranches();

      const resBody = response.data;
      const list = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody?.resultSet)
        ? resBody.resultSet
        : Array.isArray(resBody?.branches)
        ? resBody.branches
        : Array.isArray(resBody)
        ? resBody
        : [];

      dispatch({
        type: BRANCH_FETCH_SUCCESS,
        payload: list,
      });

      return true;
    } catch (err) {
      const message = logAndExtractError('Fetch branches', err);

      dispatch({
        type: BRANCH_FETCH_FAILURE,
        payload: message,
      });

      return false;
    }
  };
};


// ============================================================
// ADD / CREATE BRANCH
// ============================================================

export const addBranch = (name, address, phone) => {
  return async (dispatch) => {

    if (!name || !address || !phone) {
      const message = 'Branch name, address and phone are required.';

      dispatch({
        type: BRANCH_ADD_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }

    dispatch({ type: BRANCH_ADD_START });

    try {
      await BranchService.createBranch(
        name,
        address,
        phone
      );

      dispatch({
        type: BRANCH_ADD_SUCCESS,
        payload: {
          name,
          address,
          phone,
        },
      });

      // Refresh branch list
      dispatch(fetchBranches());

      return {
        success: true,
      };

    } catch (err) {
      const message = logAndExtractError(
        'Add branch',
        err
      );

      dispatch({
        type: BRANCH_ADD_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  };
};


// ============================================================
// UPDATE BRANCH
// ============================================================

export const updateBranch = (
  branchId,
  name,
  address,
  phone
) => {
  return async (dispatch) => {

    if (!branchId || !name || !address || !phone) {
      const message =
        'Branch ID, name, address and phone are required.';

      dispatch({
        type: BRANCH_UPDATE_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }

    dispatch({
      type: BRANCH_UPDATE_START,
    });

    try {
      await BranchService.updateBranch(
        branchId,
        name,
        address,
        phone
      );

      dispatch({
        type: BRANCH_UPDATE_SUCCESS,
        payload: {
          branch_id: branchId,
          name,
          address,
          phone,
        },
      });

      // Refresh branch list
      dispatch(fetchBranches());

      return {
        success: true,
      };

    } catch (err) {
      const message = logAndExtractError(
        'Update branch',
        err
      );

      dispatch({
        type: BRANCH_UPDATE_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  };
};


// ============================================================
// DELETE BRANCH
// ============================================================

export const deleteBranch = (branchId) => {
  return async (dispatch) => {

    if (!branchId) {
      const message = 'Branch ID is required.';

      dispatch({
        type: BRANCH_DELETE_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }

    dispatch({
      type: BRANCH_DELETE_START,
    });

    try {
      await BranchService.deleteBranch(branchId);

      dispatch({
        type: BRANCH_DELETE_SUCCESS,
        payload: branchId,
      });

      // Refresh branch list
      dispatch(fetchBranches());

      return {
        success: true,
      };

    } catch (err) {
      const message = logAndExtractError(
        'Delete branch',
        err
      );

      dispatch({
        type: BRANCH_DELETE_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  };
};


// ============================================================
// FETCH USERS ACCORDING TO BRANCH
// ============================================================

export const fetchUsersByBranch = (branchId) => {
  return async (dispatch) => {

    if (!branchId) {
      const message = 'Branch ID is required.';

      dispatch({
        type: BRANCH_USERS_FETCH_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }

    dispatch({
      type: BRANCH_USERS_FETCH_START,
    });

    try {
      const response =
        await BranchService.getUsersByBranch(branchId);

      const usersBody = response.data;
      const users = Array.isArray(usersBody?.data)
        ? usersBody.data
        : Array.isArray(usersBody?.resultSet)
        ? usersBody.resultSet
        : Array.isArray(usersBody?.users)
        ? usersBody.users
        : Array.isArray(usersBody)
        ? usersBody
        : [];

      dispatch({
        type: BRANCH_USERS_FETCH_SUCCESS,
        payload: users,
      });

      return {
        success: true,
        data: users,
      };

    } catch (err) {
      const message = logAndExtractError(
        'Fetch users by branch',
        err
      );

      dispatch({
        type: BRANCH_USERS_FETCH_FAILURE,
        payload: message,
      });

      return {
        success: false,
        error: message,
      };
    }
  };
};


// ============================================================
// FIND BRANCH BY ID
// ============================================================

export const findBranchById = (branchId) => {
  return async () => {
    if (!branchId) {
      const message = 'Branch ID is required to search.';
      return {
        success: false,
        error: message,
      };
    }

    try {
      const response = await BranchService.getBranchById(branchId);
      const resData = response.data;

      // API may return: { data: {...} }, { data: [...] }, { resultSet: [...] }
      let branch;
      if (Array.isArray(resData?.data)) {
        branch = resData.data[0];
      } else if (resData?.data && typeof resData.data === 'object') {
        branch = resData.data;
      } else if (Array.isArray(resData?.resultSet)) {
        branch = resData.resultSet[0];
      } else if (resData?.resultSet && typeof resData.resultSet === 'object') {
        branch = resData.resultSet;
      } else if (Array.isArray(resData)) {
        branch = resData[0];
      } else {
        branch = null;
      }

      if (!branch) {
        return {
          success: false,
          error: `Branch #${branchId} not found.`,
        };
      }

      return {
        success: true,
        data: branch,
      };
    } catch (err) {
      const message = logAndExtractError('Find branch by ID', err);
      return {
        success: false,
        error: message,
      };
    }
  };
};