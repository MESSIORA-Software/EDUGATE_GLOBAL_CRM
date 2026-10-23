import PipelineService from '../../services/Admin/pipelineService';
import ClientService from '../../services/Admin/clientService';
import UserService from '../../services/Admin/userService';
import {
  PIPELINE_STATUSES_FETCH_START,
  PIPELINE_STATUSES_FETCH_SUCCESS,
  PIPELINE_STATUSES_FETCH_FAILURE,

  PIPELINE_STATUS_ADD_START,
  PIPELINE_STATUS_ADD_SUCCESS,
  PIPELINE_STATUS_ADD_FAILURE,

  PIPELINE_DATA_FETCH_START,
  PIPELINE_DATA_FETCH_SUCCESS,
  PIPELINE_DATA_FETCH_FAILURE,

  PIPELINE_STUDENT_MOVE_OPTIMISTIC,
  PIPELINE_STUDENT_MOVE_SUCCESS,
  PIPELINE_STUDENT_MOVE_FAILURE,

  OPPORTUNITY_CREATE_START,
  OPPORTUNITY_CREATE_SUCCESS,
  OPPORTUNITY_CREATE_FAILURE,

  PIPELINE_STATUS_UPDATE_START,
  PIPELINE_STATUS_UPDATE_SUCCESS,
  PIPELINE_STATUS_UPDATE_FAILURE,

  PIPELINE_STATUS_DELETE_START,
  PIPELINE_STATUS_DELETE_SUCCESS,
  PIPELINE_STATUS_DELETE_FAILURE,
} from '../../constants/Admin/pipelineConstants';

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

// 1. Fetch only statuses
export const fetchPipelineStatuses = () => {
  return async (dispatch) => {
    dispatch({ type: PIPELINE_STATUSES_FETCH_START });
    try {
      const response = await PipelineService.getAllOpportunityStatuses();
      const resBody = response.data;
      const rawStatuses = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
        ? resBody
        : [];

      // Sort by stage_order ascending
      const sorted = [...rawStatuses].sort((a, b) => (a.stage_order || 0) - (b.stage_order || 0));

      dispatch({
        type: PIPELINE_STATUSES_FETCH_SUCCESS,
        payload: sorted,
      });
      return { success: true, data: sorted };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: PIPELINE_STATUSES_FETCH_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};

// 2. Fetch full pipeline: statuses, clients, and created opportunities by status
export const fetchPipelineData = () => {
  return async (dispatch) => {
    dispatch({ type: PIPELINE_DATA_FETCH_START });
    try {
      // Step A: Fetch statuses
      const statusRes = await PipelineService.getAllOpportunityStatuses();
      const rawStatuses = Array.isArray(statusRes.data?.data)
        ? statusRes.data.data
        : Array.isArray(statusRes.data)
        ? statusRes.data
        : [];
      const statuses = [...rawStatuses].sort((a, b) => (a.stage_order || 0) - (b.stage_order || 0));

      // Step B: Fetch all clients to map details onto opportunities
      const clientsRes = await ClientService.getAllClients();
      const rawClients = Array.isArray(clientsRes.data?.data)
        ? clientsRes.data.data
        : Array.isArray(clientsRes.data)
        ? clientsRes.data
        : [];

      const clientsMap = {};
      rawClients.forEach((c) => {
        const id = c.client_id || c.id;
        if (id) clientsMap[id] = c;
      });

      // Step C: Fetch users / staff to map assigned staff names and initials
      let usersMap = {};
      try {
        const usersRes = await UserService.getAllUsers();
        const rawUsers = Array.isArray(usersRes?.data)
          ? usersRes.data
          : Array.isArray(usersRes)
          ? usersRes
          : [];
        rawUsers.forEach((u) => {
          const uId = u.user_id || u.id;
          if (uId) usersMap[uId] = u;
        });
      } catch {
        // non-blocking
      }

      // Step D: Fetch opportunities for every status
      const opportunitiesList = [];
      await Promise.all(
        statuses.map(async (st) => {
          try {
            const oppRes = await PipelineService.getOpportunitiesByStatus(st.status_id);
            const opps = Array.isArray(oppRes.data?.data)
              ? oppRes.data.data
              : Array.isArray(oppRes.data)
              ? oppRes.data
              : [];

            opps.forEach((opp) => {
              const matchedClient = clientsMap[opp.client_id];
              const matchedStaff = opp.assigned_staff_id ? usersMap[opp.assigned_staff_id] : null;
              opportunitiesList.push({
                ...opp,
                client: matchedClient || {
                  client_id: opp.client_id,
                  name: `Client #${opp.client_id}`,
                },
                staff: matchedStaff || null,
              });
            });
          } catch {
            // Non-blocking per status
          }
        })
      );

      dispatch({
        type: PIPELINE_DATA_FETCH_SUCCESS,
        payload: {
          statuses,
          clients: rawClients,
          opportunities: opportunitiesList,
        },
      });

      return { success: true, statuses, opportunities: opportunitiesList };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: PIPELINE_DATA_FETCH_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};

// 3. Move Opportunity to new status (Drag & Drop or menu selection)
export const moveOpportunityStatus = (
  opportunityId,
  clientId,
  newStatusId,
  assignedStaffId,
  noteId
) => {
  return async (dispatch, getState) => {
    const opportunities = getState().pipeline?.opportunities || [];
    const targetOpp = opportunities.find((o) => o.opportunity_id === opportunityId);
    const previousStatusId = targetOpp?.status_id;

    if (previousStatusId === newStatusId) {
      return { success: true };
    }

    // Preserve existing staff assignment and note
    const resolvedStaffId =
      assignedStaffId !== undefined
        ? assignedStaffId
        : targetOpp?.assigned_staff_id !== undefined
        ? targetOpp.assigned_staff_id
        : targetOpp?.staff?.user_id ?? targetOpp?.staff?.id ?? null;

    const resolvedNoteId =
      noteId !== undefined ? noteId : targetOpp?.note_id ?? null;

    const resolvedClientId = clientId || targetOpp?.client_id;

    // 1. Optimistic Update in Redux
    dispatch({
      type: PIPELINE_STUDENT_MOVE_OPTIMISTIC,
      payload: {
        opportunityId,
        statusId: newStatusId,
        assignedStaffId: resolvedStaffId,
      },
    });

    try {
      await PipelineService.updateOpportunity(
        opportunityId,
        resolvedClientId,
        newStatusId,
        resolvedStaffId,
        resolvedNoteId
      );

      dispatch({
        type: PIPELINE_STUDENT_MOVE_SUCCESS,
        payload: {
          opportunityId,
          statusId: newStatusId,
          assignedStaffId: resolvedStaffId,
        },
      });

      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      // Rollback
      dispatch({
        type: PIPELINE_STUDENT_MOVE_FAILURE,
        payload: {
          opportunityId,
          previousStatusId,
          error: errorMsg,
        },
      });
      return { success: false, error: errorMsg };
    }
  };
};

// 4. Create Opportunity for a Student (from Students page or Pipeline)
export const createOpportunityForStudent = (params = {}, extraData = {}) => {
  return async (dispatch, getState) => {
    const rawClientId = params?.clientId ?? params?.client_id;
    const clientId = rawClientId ? Number(rawClientId) : null;
    const assignedStaffId = params?.assignedStaffId ?? params?.assigned_staff_id ?? null;
    const statusId = params?.statusId ?? params?.status_id ?? null;
    const note = params?.note ?? '';

    if (!clientId) {
      return { success: false, error: 'Client ID is required.' };
    }

    const { statuses = [] } = getState().pipeline ?? {};
    let finalStatusId = Number(statusId);

    // Ensure statusId exists in DB statuses to prevent foreign key violation
    if (statuses.length > 0) {
      const exists = statuses.some((s) => s.status_id === finalStatusId);
      if (!exists) {
        const stage1 = statuses.find((s) => s.stage_order === 1) || statuses[0];
        finalStatusId = stage1?.status_id || finalStatusId;
      }
    }

    dispatch({ type: OPPORTUNITY_CREATE_START });
    try {
      // 1. Call create opportunity API
      const response = await PipelineService.createOpportunity(
        clientId,
        finalStatusId,
        assignedStaffId ? Number(assignedStaffId) : null
      );

      const createdData = response.data?.data;
      let createdOpportunityId =
        createdData?.opportunity_id ||
        (Array.isArray(createdData) && createdData[0]?.opportunity_id) ||
        null;

      // 2. If a note was entered, create note linked to this opportunity
      if (note && note.trim()) {
        try {
          if (!createdOpportunityId) {
            const oppRes = await PipelineService.getOpportunitiesByStatus(finalStatusId);
            const opps = Array.isArray(oppRes.data?.data) ? oppRes.data.data : [];
            const found = opps.find((o) => o.client_id === clientId);
            createdOpportunityId = found?.opportunity_id || null;
          }
          if (createdOpportunityId) {
            await PipelineService.createOpportunityNote(createdOpportunityId, note.trim());
          }
        } catch (noteErr) {
          console.warn('Note creation warning:', noteErr.message);
        }
      }

      dispatch({
        type: OPPORTUNITY_CREATE_SUCCESS,
        payload: createdData,
      });

      // Refresh pipeline data to show the new opportunity in its column
      dispatch(fetchPipelineData());

      return { success: true, data: createdData };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: OPPORTUNITY_CREATE_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};

// 5. Create new Status dynamically
export const addOpportunityStatus = (status_name, stage_order = 1) => {
  return async (dispatch) => {
    if (!status_name?.trim()) {
      return { success: false, error: 'Status name is required.' };
    }

    dispatch({ type: PIPELINE_STATUS_ADD_START });
    try {
      const res = await PipelineService.createOpportunityStatus(
        status_name.trim(),
        stage_order,
        true
      );
      dispatch({
        type: PIPELINE_STATUS_ADD_SUCCESS,
        payload: res.data?.data,
      });

      // Refresh full pipeline to update columns
      dispatch(fetchPipelineData());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: PIPELINE_STATUS_ADD_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};

// 6. Update Pipeline Status
export const updatePipelineStatus = (status_id, status_name, stage_order = 1, is_active = true) => {
  return async (dispatch) => {
    if (!status_id || !status_name?.trim()) {
      return { success: false, error: 'Status ID and Name are required.' };
    }

    dispatch({ type: PIPELINE_STATUS_UPDATE_START });
    try {
      const res = await PipelineService.updateOpportunityStatus(
        status_id,
        status_name.trim(),
        Number(stage_order) || 1,
        is_active
      );
      dispatch({
        type: PIPELINE_STATUS_UPDATE_SUCCESS,
        payload: res.data?.data,
      });

      dispatch(fetchPipelineData());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: PIPELINE_STATUS_UPDATE_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};

// 7. Delete Pipeline Status
export const deletePipelineStatus = (status_id) => {
  return async (dispatch) => {
    if (!status_id) {
      return { success: false, error: 'Status ID is required.' };
    }

    dispatch({ type: PIPELINE_STATUS_DELETE_START });
    try {
      await PipelineService.deleteOpportunityStatus(status_id);
      dispatch({
        type: PIPELINE_STATUS_DELETE_SUCCESS,
        payload: status_id,
      });

      dispatch(fetchPipelineData());
      return { success: true };
    } catch (err) {
      const errorMsg = extractError(err);
      dispatch({
        type: PIPELINE_STATUS_DELETE_FAILURE,
        payload: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };
};
