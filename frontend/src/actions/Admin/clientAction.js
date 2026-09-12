import ClientService from '../../services/Admin/clientService';
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

function extractError(err) {
  if (err.response) {
    return (
      err.response.data?.message ||
      err.response.data?.error ||
      `Server error (${err.response.status})`
    );
  } else if (err.request) {
    return 'No response from server. Check network connection.';
  }
  return err.message || 'Something went wrong.';
}

// 1. Fetch All Clients
export const fetchClients = () => {
  return async (dispatch) => {
    dispatch({ type: CLIENT_FETCH_START });
    try {
      const response = await ClientService.getAllClients();
      const resBody = response.data;
      const list = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
        ? resBody
        : [];

      dispatch({
        type: CLIENT_FETCH_SUCCESS,
        payload: list,
      });
      return { success: true, data: list };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: CLIENT_FETCH_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};

// 2. Add / Create Client
export const addClient = (name, email, dob, source) => {
  return async (dispatch) => {
    if (!name || !email) {
      const message = 'Client Name and Email are required.';
      dispatch({ type: CLIENT_ADD_FAILURE, payload: message });
      return { success: false, error: message };
    }

    dispatch({ type: CLIENT_ADD_START });
    try {
      const response = await ClientService.createClient(name, email, dob, source);
      dispatch({
        type: CLIENT_ADD_SUCCESS,
        payload: response.data?.data || { name, email, dob, source },
      });
      dispatch(fetchClients());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({ type: CLIENT_ADD_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

// 3. Update Client
export const updateClient = (clientId, name, email, dob, source) => {
  return async (dispatch) => {
    if (!clientId) {
      const message = 'Client ID is required.';
      dispatch({ type: CLIENT_UPDATE_FAILURE, payload: message });
      return { success: false, error: message };
    }

    dispatch({ type: CLIENT_UPDATE_START });
    try {
      const response = await ClientService.updateClient(clientId, name, email, dob, source);
      dispatch({
        type: CLIENT_UPDATE_SUCCESS,
        payload: response.data?.data || { client_id: clientId, name, email, dob, source },
      });
      dispatch(fetchClients());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({ type: CLIENT_UPDATE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

// 4. Delete Client
export const deleteClient = (clientId) => {
  return async (dispatch) => {
    if (!clientId) {
      const message = 'Client ID is required.';
      dispatch({ type: CLIENT_DELETE_FAILURE, payload: message });
      return { success: false, error: message };
    }

    dispatch({ type: CLIENT_DELETE_START });
    try {
      await ClientService.deleteClient(clientId);
      dispatch({
        type: CLIENT_DELETE_SUCCESS,
        payload: clientId,
      });
      dispatch(fetchClients());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({ type: CLIENT_DELETE_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };
};

// 5. Get Client by ID
export const getClientById = (clientId) => {
  return async () => {
    if (!clientId) {
      return { success: false, error: 'Client ID is required.' };
    }
    try {
      const response = await ClientService.getClientById(clientId);
      const resData = response.data;
      const client = Array.isArray(resData?.data) ? resData.data[0] : resData?.data || resData;

      if (!client) {
        return { success: false, error: `Client #${clientId} not found.` };
      }
      return { success: true, data: client };
    } catch (err) {
      return { success: false, error: extractError(err) };
    }
  };
};
