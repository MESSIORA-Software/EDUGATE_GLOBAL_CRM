import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, viewMyProfile, logout } from '../../actions/Auth/authActions';

export default function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { token, user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth || {}
  );

  // Form states for login
  const [email, setEmail] = useState('kamal@example.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Fetch user profile on mount if token exists but user details are missing
  useEffect(() => {
    if (token && !user) {
      dispatch(viewMyProfile(token));
    }
  }, [dispatch, token, user]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleLogin = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setLocalError('');

      if (!email.trim() || !password.trim()) {
        setLocalError('Please enter both email and password.');
        return { success: false, error: 'Please enter both email and password.' };
      }

      const res = await dispatch(login(email.trim(), password));
      if (res.success) {
        navigate('/');
      }
      return res;
    },
    [dispatch, email, password, navigate]
  );

  const handleLogout = useCallback(
    (callback) => {
      dispatch(logout());
      if (typeof callback === 'function') {
        callback();
      }
      navigate('/login');
    },
    [dispatch, navigate]
  );

  const fetchProfile = useCallback(
    async (authToken) => {
      return await dispatch(viewMyProfile(authToken || token));
    },
    [dispatch, token]
  );

  const displayError = localError || error;

  return {
    // Auth State
    token,
    user,
    isAuthenticated,
    loading,
    error,
    displayError,

    // Form State
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    toggleShowPassword,
    localError,
    setLocalError,

    // Handlers
    handleLogin,
    handleLogout,
    fetchProfile,
  };
}
