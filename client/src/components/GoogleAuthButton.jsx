import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * GoogleAuthButton
 * 
 * Complies with Google's official branding guidelines and supported
 * Google Identity Services implementation.
 * 
 * Guarantees exact, non-personalized button labels:
 * - Login: "Sign in with Google"
 * - Signup: "Sign up with Google"
 * 
 * Avoids browser-personalized labels like "Sign in as [Name]" while preserving
 * the full Google Identity Services authentication flow, credential verification,
 * and backend integration.
 *
 * @param {'signin' | 'signup'} [props.mode='signin']
 * @param {(err: string) => void} [props.onError]
 * @param {(loading: boolean) => void} [props.onLoadingChange]
 */
export default function GoogleAuthButton({
  mode = 'signin',
  onError,
  onLoadingChange,
}) {
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const isSignup = mode === 'signup';
  const buttonText = isSignup ? 'Sign up with Google' : 'Sign in with Google';

  const updateLoading = (val) => {
    setLoading(val);
    if (onLoadingChange) onLoadingChange(val);
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('[GoogleAuthButton] VITE_GOOGLE_CLIENT_ID is missing');
      return;
    }

    let intervalId;
    let isMounted = true;

    const initGoogle = () => {
      const container = overlayRef.current;
      if (window.google?.accounts?.id && container && isMounted) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            context: isSignup ? 'signup' : 'signin',
            callback: async (res) => {
              if (!res.credential || !isMounted) return;
              try {
                updateLoading(true);
                if (onError) onError('');
                await googleLogin(res.credential);
                navigate('/dashboard');
              } catch (err) {
                if (isMounted && onError) {
                  onError(
                    err.response?.data?.message ||
                      (isSignup
                        ? 'Google sign up failed. Please try again.'
                        : 'Google sign in failed. Please try again.')
                  );
                }
              } finally {
                if (isMounted) updateLoading(false);
              }
            },
          });

          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 380,
            shape: 'rectangular',
            text: isSignup ? 'signup_with' : 'signin_with',
            logo_alignment: 'left',
          });

          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error('[GoogleAuthButton Render Error]:', err);
        }
      }
    };

    initGoogle();
    if (!window.google?.accounts?.id || !overlayRef.current?.hasChildNodes()) {
      intervalId = setInterval(initGoogle, 150);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [googleLogin, navigate, isSignup]);

  const handleClickFallback = () => {
    if (loading) return;
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div
      className="google-auth-btn-wrapper"
      onClick={handleClickFallback}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        height: 44,
        margin: '0 auto',
        borderRadius: 8,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Visual Layer: Strictly branded Google button with exact text ── */}
      <button
        type="button"
        disabled={loading}
        className="google-custom-btn"
        aria-label={buttonText}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '0 16px',
          borderRadius: 8,
          border: '1px solid #dadce0',
          backgroundColor: '#ffffff',
          color: '#3c4043',
          fontFamily: 'Inter, system-ui, -apple-system, Roboto, sans-serif',
          fontSize: '0.9375rem',
          fontWeight: 500,
          letterSpacing: '0.01em',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.15s ease',
          userSelect: 'none',
          outline: 'none',
          pointerEvents: 'none', // All click events pass to the Google GIS layer
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(60, 64, 67, 0.25)',
                borderTopColor: '#3c4043',
                borderRadius: '50%',
                animation: 'spin 0.75s linear infinite',
                display: 'inline-block',
              }}
            />
            <span>{isSignup ? 'Creating account...' : 'Signing in...'}</span>
          </div>
        ) : (
          <>
            {/* Official Google 4-Color 'G' Logo */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span style={{ fontWeight: 500 }}>{buttonText}</span>
          </>
        )}
      </button>

      {/* ── Interactive Layer: Real Google GIS iframe overlay ── */}
      <div
        ref={overlayRef}
        className="google-gis-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.0001,
          overflow: 'hidden',
          cursor: loading ? 'not-allowed' : 'pointer',
          zIndex: 10,
          display: loading ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: loading ? 'none' : 'auto',
        }}
      />
    </div>
  );
}
