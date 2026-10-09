import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useMedia from '../../hooks/Media/useMedia';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { COLORS } from '../../constants/colors';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuthCallback } = useMedia();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setTimeout(() => navigate('/media'), 3000);
      return;
    }

    const processCallback = async () => {
      try {
        await handleGoogleAuthCallback(code);
        setStatus('success');
        setTimeout(() => navigate('/media'), 2000);
      } catch (error) {
        setStatus('error');
        setTimeout(() => navigate('/media'), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleGoogleAuthCallback, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div 
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        className="p-8 rounded-2xl border shadow-lg flex flex-col items-center max-w-sm w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#1E3A8A]" />
            <h2 className="text-xl font-bold text-slate-800">Connecting...</h2>
            <p className="text-sm text-slate-500 mt-2">Completing Google Drive integration.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 mb-4 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-800">Connected!</h2>
            <p className="text-sm text-slate-500 mt-2">Redirecting back to Media Storage...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-slate-800">Connection Failed</h2>
            <p className="text-sm text-slate-500 mt-2">Could not authorize Google Drive. Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
