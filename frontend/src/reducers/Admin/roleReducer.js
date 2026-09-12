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
} from "../../constants/Admin/RoleConstants";

const initialState = {
  roles: [],
  selectedRole: null,
  loading: false,
  submitting: false,
  error: null,
};

export default function roleReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ROLES_START:
      return { ...state, loading: true, error: null };
    case FETCH_ROLES_SUCCESS:
      return { ...state, loading: false, roles: action.payload, error: null };
    case FETCH_ROLES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FIND_ROLE_START:
      return { ...state, loading: true, error: null };
    case FIND_ROLE_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedRole: action.payload,
        error: null,
      };
    case FIND_ROLE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case ROLE_ADD_START:
    case ROLE_UPDATE_START:
    case ROLE_DELETE_START:
      return { ...state, submitting: true, error: null };

    case ROLE_ADD_SUCCESS:
      return { ...state, submitting: false, error: null };

    case ROLE_UPDATE_SUCCESS:
      return { ...state, submitting: false, error: null };

    case ROLE_DELETE_SUCCESS:
      return {
        ...state,
        submitting: false,
        roles: state.roles.filter((r) => r.role_id !== action.payload),
        error: null,
      };

    case ROLE_ADD_FAILURE:
    case ROLE_UPDATE_FAILURE:
    case ROLE_DELETE_FAILURE:
      return { ...state, submitting: false, error: action.payload };

    case CLEAR_SELECTED_ROLE:
      return { ...state, selectedRole: null };

    default:
      return state;
  }
}
