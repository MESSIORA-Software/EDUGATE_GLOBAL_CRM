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

const initialState = {
  statuses: [],
  clients: [],
  opportunities: [],
  loading: false,
  statusLoading: false,
  addingStatus: false,
  updatingStatus: false,
  deletingStatus: false,
  creatingOpportunity: false,
  movingStudent: false,
  error: null,
};

export default function pipelineReducer(state = initialState, action) {
  switch (action.type) {
    // Pipeline statuses only
    case PIPELINE_STATUSES_FETCH_START:
      return { ...state, statusLoading: true, error: null };
    case PIPELINE_STATUSES_FETCH_SUCCESS:
      return { ...state, statusLoading: false, statuses: action.payload };
    case PIPELINE_STATUSES_FETCH_FAILURE:
      return { ...state, statusLoading: false, error: action.payload };

    // Full Pipeline Data
    case PIPELINE_DATA_FETCH_START:
      return { ...state, loading: true, error: null };
    case PIPELINE_DATA_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        statuses: action.payload.statuses,
        clients: action.payload.clients,
        opportunities: action.payload.opportunities,
      };
    case PIPELINE_DATA_FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Add Status
    case PIPELINE_STATUS_ADD_START:
      return { ...state, addingStatus: true, error: null };
    case PIPELINE_STATUS_ADD_SUCCESS:
      return { ...state, addingStatus: false };
    case PIPELINE_STATUS_ADD_FAILURE:
      return { ...state, addingStatus: false, error: action.payload };

    // Update Status
    case PIPELINE_STATUS_UPDATE_START:
      return { ...state, updatingStatus: true, error: null };
    case PIPELINE_STATUS_UPDATE_SUCCESS:
      return { ...state, updatingStatus: false };
    case PIPELINE_STATUS_UPDATE_FAILURE:
      return { ...state, updatingStatus: false, error: action.payload };

    // Delete Status
    case PIPELINE_STATUS_DELETE_START:
      return { ...state, deletingStatus: true, error: null };
    case PIPELINE_STATUS_DELETE_SUCCESS:
      return { ...state, deletingStatus: false };
    case PIPELINE_STATUS_DELETE_FAILURE:
      return { ...state, deletingStatus: false, error: action.payload };

    // Create Opportunity
    case OPPORTUNITY_CREATE_START:
      return { ...state, creatingOpportunity: true, error: null };
    case OPPORTUNITY_CREATE_SUCCESS:
      return { ...state, creatingOpportunity: false };
    case OPPORTUNITY_CREATE_FAILURE:
      return { ...state, creatingOpportunity: false, error: action.payload };

    // Move Opportunity Status (Optimistic)
    case PIPELINE_STUDENT_MOVE_OPTIMISTIC: {
      const { opportunityId, statusId } = action.payload;
      return {
        ...state,
        movingStudent: true,
        opportunities: state.opportunities.map((opp) =>
          opp.opportunity_id === opportunityId ? { ...opp, status_id: statusId } : opp
        ),
      };
    }

    // Move Opportunity Status (Success)
    case PIPELINE_STUDENT_MOVE_SUCCESS:
      return {
        ...state,
        movingStudent: false,
      };

    // Move Opportunity Status (Failure - Rollback)
    case PIPELINE_STUDENT_MOVE_FAILURE: {
      const { opportunityId, previousStatusId, error } = action.payload;
      return {
        ...state,
        movingStudent: false,
        error,
        opportunities: state.opportunities.map((opp) =>
          opp.opportunity_id === opportunityId ? { ...opp, status_id: previousStatusId } : opp
        ),
      };
    }

    default:
      return state;
  }
}
