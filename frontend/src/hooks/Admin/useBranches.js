import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';

import {
  fetchBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  fetchUsersByBranch,
} from '../../../actions/Admin/branchActions';


export default function useBranches() {

  const dispatch = useDispatch();

  const navigation = useNavigation();


  // ============================================================
  // REDUX STATE
  // ============================================================

  const {
    list: branches = [],
    loading: apiLoading = false,
    error: apiError = null,
  } = useSelector((state) => state.branch);


  // ============================================================
  // FETCH BRANCHES WHEN SCREEN LOADS
  // ============================================================

  useEffect(() => {

    dispatch(fetchBranches());

  }, [dispatch]);


  // ============================================================
  // GET BADGE CODE
  // ============================================================

  const getBadgeCode = (name) => {

    if (!name) return '??';

    return name
      .trim()
      .toUpperCase()
      .slice(0, 3);

  };


  // ============================================================
  // TOTAL BRANCH COUNT
  // ============================================================

  const totalCount = branches.length;


  // ============================================================
  // ACTIVE BRANCH COUNT
  // ============================================================
  // If your API has a status field, this can be changed later.

  const activeCount = branches.length;


  // ============================================================
  // REFRESH BRANCHES
  // ============================================================

  const handleRefresh = () => {

    dispatch(fetchBranches());

  };


  // ============================================================
  // CREATE BRANCH
  // ============================================================

  const handleAddBranch = async (
    name,
    address,
    phone
  ) => {

    const result = await dispatch(
      addBranch(
        name,
        address,
        phone
      )
    );

    return result;

  };


  // ============================================================
  // UPDATE BRANCH
  // ============================================================

  const handleUpdateBranch = async (
    branchId,
    name,
    address,
    phone
  ) => {

    const result = await dispatch(
      updateBranch(
        branchId,
        name,
        address,
        phone
      )
    );

    return result;

  };


  // ============================================================
  // DELETE BRANCH
  // ============================================================

  const handleDeleteBranch = async (branchId) => {

    const result = await dispatch(
      deleteBranch(branchId)
    );

    return result;

  };


  // ============================================================
  // GET BRANCH BY ID
  // ============================================================

  const getBranchById = (branchId) => {

    if (!branchId) return null;

    return branches.find(
      (branch) =>
        String(branch.branch_id) === String(branchId)
    );

  };


  // ============================================================
  // GET USERS ACCORDING TO BRANCH
  // ============================================================

  const handleFetchUsersByBranch = async (branchId) => {

    const result = await dispatch(
      fetchUsersByBranch(branchId)
    );

    return result;

  };


  // ============================================================
  // GET BRANCH NAME
  // ============================================================

  const getBranchName = (branchId) => {

    const branch = getBranchById(branchId);

    return branch?.name || '';

  };


  // ============================================================
  // GET BRANCH ADDRESS
  // ============================================================

  const getBranchAddress = (branchId) => {

    const branch = getBranchById(branchId);

    return branch?.address || '';

  };


  // ============================================================
  // GET BRANCH PHONE
  // ============================================================

  const getBranchPhone = (branchId) => {

    const branch = getBranchById(branchId);

    return branch?.phone || '';

  };


  // ============================================================
  // RETURN EVERYTHING
  // ============================================================

  return {

    // Branch data
    branches,

    // Loading & error
    apiLoading,
    apiError,

    // Counts
    totalCount,
    activeCount,

    // Helpers
    getBadgeCode,
    getBranchById,
    getBranchName,
    getBranchAddress,
    getBranchPhone,

    // CRUD
    handleAddBranch,
    handleUpdateBranch,
    handleDeleteBranch,

    // Users
    handleFetchUsersByBranch,

    // Refresh
    handleRefresh,

    // Navigation
    navigation,

  };

}