import { useState, useEffect, useCallback } from 'react';
import mediaService from '../../services/Media/mediaService';

const PAGE_LIMIT = 20;

export default function useMedia() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalCount / PAGE_LIMIT);

  const [searchQuery, setSearchQuery] = useState('');
  const [mimeFilter, setMimeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [uploadedByFilter, setUploadedByFilter] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchMedia = useCallback(async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_LIMIT,
      };
      if (searchQuery) params.search = searchQuery;
      if (mimeFilter) params.mime_type = mimeFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (providerFilter) params.provider = providerFilter;
      if (uploadedByFilter) params.uploaded_by = uploadedByFilter;

      const res = await mediaService.listMedia(params);
      setMediaList(res.data ?? []);
      setTotalCount(res.total ?? 0);
      setCurrentPage(res.page ?? page);
    } catch (err) {
      setError(err.message || 'Failed to load media');
      showToast(err.message || 'Failed to load media', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, mimeFilter, dateFrom, dateTo, showToast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, mimeFilter, dateFrom, dateTo, providerFilter, uploadedByFilter]);

  useEffect(() => {
    fetchMedia(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, mimeFilter, dateFrom, dateTo, providerFilter, uploadedByFilter]);

  const fetchMediaById = async (id) => {
    try {
      const res = await mediaService.getMediaById(id);
      return res.data;
    } catch (err) {
      showToast(err.message || 'Failed to fetch media details', 'error');
      return null;
    }
  };

  const handleRefresh = () => {
    fetchMedia(currentPage);
    showToast('Media list refreshed');
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const uploadMedia = async (file, provider = 'supabase') => {
    try {
      const googleAccessToken = provider === 'google_drive' ? localStorage.getItem('google_access_token') : null;
      await mediaService.uploadMedia(file, provider, googleAccessToken);
      showToast('Media uploaded successfully');
      setCurrentPage(1);
      fetchMedia(1);
      return true;
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
      return false;
    }
  };

  const deleteMedia = async (id, provider) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const googleAccessToken = provider === 'google_drive' ? localStorage.getItem('google_access_token') : null;
      await mediaService.deleteMedia(id, googleAccessToken);
      showToast('File deleted successfully');
      if (mediaList.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchMedia(currentPage);
      }
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const openMediaUrl = async (id, provider) => {
    try {
      const googleAccessToken = provider === 'google_drive' ? localStorage.getItem('google_access_token') : null;
      const res = await mediaService.getSignedUrl(id, googleAccessToken);
      if (res?.data?.url) {
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err) {
      showToast(err.message || 'Failed to open file', 'error');
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const res = await mediaService.getGoogleAuthUrl();
      if (res?.data?.auth_url) {
        window.location.href = res.data.auth_url;
      }
    } catch (err) {
      showToast(err.message || 'Failed to get auth URL', 'error');
    }
  };

  const handleGoogleAuthCallback = async (code) => {
    try {
      const res = await mediaService.handleGoogleCallback(code);
      if (res?.data?.access_token) {
        localStorage.setItem('google_access_token', res.data.access_token);
        showToast('Google Drive connected successfully');
      }
    } catch (err) {
      showToast(err.message || 'Google Drive connection failed', 'error');
      throw err;
    }
  };

  return {
    mediaList,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    mimeFilter,
    setMimeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    providerFilter,
    setProviderFilter,
    uploadedByFilter,
    setUploadedByFilter,
    toast,
    showToast,
    handleRefresh,
    goToPage,
    uploadMedia,
    deleteMedia,
    openMediaUrl,
    connectGoogleDrive,
    handleGoogleAuthCallback,
    fetchMediaById,
  };
}
