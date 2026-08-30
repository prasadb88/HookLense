import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

export const GoogleAuthButton = ({ onSuccess, onError, text = "Continue with Google" }) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // Load Google Identity Services SDK script if not present
    if (window.google?.accounts?.id) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleGoogleAuth = async () => {
    if (loading) return;

    if (!googleClientId) {
      const errorMsg = 'Google Authentication is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.';
      if (onError) onError(errorMsg);
      return;
    }

    setLoading(true);

    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response && response.credential) {
              try {
                await loginWithGoogle(response.credential);
                if (onSuccess) onSuccess();
              } catch (err) {
                if (onError) onError(err?.message || 'Google authentication failed.');
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
              if (onError) onError('Google login was cancelled.');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Trigger Google Prompt (One Tap / Select Account)
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const reason = notification.getNotDisplayedReason() || notification.getSkippedReason();
            
            // Fallback: If One-Tap is suppressed or skipped, trigger OAuth popup client
            if (window.google?.accounts?.oauth2) {
              const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: googleClientId,
                scope: 'email profile openid',
                callback: async (tokenResponse) => {
                  if (tokenResponse && (tokenResponse.access_token || tokenResponse.id_token)) {
                    try {
                      await loginWithGoogle(tokenResponse.id_token || tokenResponse.access_token);
                      if (onSuccess) onSuccess();
                    } catch (err) {
                      if (onError) onError(err?.message || 'Google authentication failed.');
                    } finally {
                      setLoading(false);
                    }
                  } else {
                    setLoading(false);
                    if (onError) onError('Google authentication cancelled.');
                  }
                },
                error_callback: () => {
                  setLoading(false);
                  if (onError) onError('Google Sign-In popup failed or was blocked.');
                }
              });
              tokenClient.requestAccessToken();
            } else {
              setLoading(false);
              if (onError) onError('Google Sign-In prompt could not be displayed. Please check pop-up settings.');
            }
          }
        });
      } else {
        setLoading(false);
        if (onError) onError('Google SDK is loading. Please try again in a moment.');
      }
    } catch (err) {
      setLoading(false);
      if (onError) onError(err?.message || 'An error occurred during Google Sign-In.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      aria-label={text}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl font-medium text-xs font-mono transition-all duration-200 shadow-sm border
                 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                 dark:bg-[#161B26] dark:text-gray-200 dark:border-[#262D3D] dark:hover:bg-[#1E2536] dark:hover:border-[#343D52]
                 disabled:opacity-60 disabled:cursor-not-allowed select-none"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{loading ? 'Authenticating with Google...' : text}</span>
    </button>
  );
};

export default GoogleAuthButton;
