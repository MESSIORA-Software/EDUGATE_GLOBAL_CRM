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


const initialState = {

  list: [],

  loading: false,

  adding: false,

  updating: false,

  deleting: false,

  users: [],

  usersLoading: false,

  error: null,

};


export default function branchReducer(
  state = initialState,
  action
) {

  switch (action.type) {


    // ============================================================
    // FETCH ALL BRANCHES
    // ============================================================

    case BRANCH_FETCH_START:

      return {
        ...state,
        loading: true,
        error: null,
      };


    case BRANCH_FETCH_SUCCESS:

      return {
        ...state,
        loading: false,
        list: action.payload,
      };


    case BRANCH_FETCH_FAILURE:

      return {
        ...state,
        loading: false,
        error: action.payload,
      };


    // ============================================================
    // ADD BRANCH
    // ============================================================

    case BRANCH_ADD_START:

      return {
        ...state,
        adding: true,
        error: null,
      };


    case BRANCH_ADD_SUCCESS:

      return {
        ...state,
        adding: false,
      };


    case BRANCH_ADD_FAILURE:

      return {
        ...state,
        adding: false,
        error: action.payload,
      };


    // ============================================================
    // UPDATE BRANCH
    // ============================================================

    case BRANCH_UPDATE_START:

      return {
        ...state,
        updating: true,
        error: null,
      };


    case BRANCH_UPDATE_SUCCESS:

      return {
        ...state,
        updating: false,
      };


    case BRANCH_UPDATE_FAILURE:

      return {
        ...state,
        updating: false,
        error: action.payload,
      };


    // ============================================================
    // DELETE BRANCH
    // ============================================================

    case BRANCH_DELETE_START:

      return {
        ...state,
        deleting: true,
        error: null,
      };


    case BRANCH_DELETE_SUCCESS:

      return {
        ...state,
        deleting: false,
      };


    case BRANCH_DELETE_FAILURE:

      return {
        ...state,
        deleting: false,
        error: action.payload,
      };


    // ============================================================
    // FETCH USERS BY BRANCH
    // ============================================================

    case BRANCH_USERS_FETCH_START:

      return {
        ...state,
        usersLoading: true,
        error: null,
      };


    case BRANCH_USERS_FETCH_SUCCESS:

      return {
        ...state,
        usersLoading: false,
        users: action.payload,
      };


    case BRANCH_USERS_FETCH_FAILURE:

      return {
        ...state,
        usersLoading: false,
        error: action.payload,
      };


    // ============================================================
    // DEFAULT
    // ============================================================

    default:

      return state;

  }

}