'use client';

import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

type GoogleIdentityApi = {
  initialize(options: {
    client_id: string;
    nonce: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(element: HTMLElement, options: {
    theme: 'outline';
    size: 'large';
    text: 'signin_with' | 'signup_with';
    locale: 'vi';
  }): void;
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function googleErrorMessage(error: unknown): string {
  if (error instanceof Error && !(error instanceof TypeError || error instanceof SyntaxError)) {
    return error.message;
  }
  return 'Không thể kết nối đăng nhập Google. Vui lòng thử lại.';
}

/** Renders Google's popup button for either auth mode and shows challenge and sign-in status. */
export default function GoogleSignInButton({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const button = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [buttonReady, setButtonReady] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const container = button.current;
    const google = (window as Window & { google?: { accounts: { id: GoogleIdentityApi } } }).google;
    if (!scriptReady || !GOOGLE_CLIENT_ID || !container) return;
    if (!google?.accounts?.id) {
      setError('Không thể tải nút Google. Vui lòng tải lại trang hoặc dùng email.');
      return;
    }

    const controller = new AbortController();
    const clientId = GOOGLE_CLIENT_ID;
    let submitted = false;

    async function prepareButton(api: GoogleIdentityApi, element: HTMLDivElement) {
      try {
        const nonce = await authService.requestGoogleChallenge(controller.signal);
        if (controller.signal.aborted) return;
        api.initialize({
          client_id: clientId,
          nonce,
          callback: async ({ credential }) => {
            if (controller.signal.aborted || submitted) return;
            submitted = true;
            setSubmitting(true);
            element.replaceChildren();
            try {
              const user = await authService.loginWithGoogle(credential);
              setUser(user);
              router.replace('/');
              router.refresh();
            } catch (failure) {
              if (controller.signal.aborted) return;
              setError(googleErrorMessage(failure));
              setButtonReady(false);
              setSubmitting(false);
            }
          },
        });
        api.renderButton(element, {
          theme: 'outline',
          size: 'large',
          text: mode === 'login' ? 'signin_with' : 'signup_with',
          locale: 'vi',
        });
        setButtonReady(true);
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(googleErrorMessage(failure));
        }
      }
    }

    void prepareButton(google.accounts.id, container);
    return () => {
      controller.abort();
      container.replaceChildren();
    };
  }, [attempt, mode, router, scriptReady, setUser]);

  return (
    <div className="space-y-2 text-center">
      {/* Google button and sign-in status */}
      {GOOGLE_CLIENT_ID && (
        <>
          <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive"
            onReady={() => setScriptReady(true)}
            onError={() => setError('Không thể tải nút Google. Vui lòng tải lại trang hoặc dùng email.')} />
          <div className="flex w-full justify-center" ref={button} />
        </>
      )}
      {!GOOGLE_CLIENT_ID && <p className="text-sm text-outline">Đăng nhập Google chưa được cấu hình.</p>}
      {GOOGLE_CLIENT_ID && !error && (isSubmitting || !buttonReady) && (
        <p role="status" className="text-sm text-outline">
          {isSubmitting ? 'Đang đăng nhập…' : 'Đang tải nút Google…'}
        </p>
      )}
      {error && (
        <>
          <p role="alert" className="text-sm text-error dark:text-red-300">{error}</p>
          {scriptReady && (
            <button type="button" className="text-sm font-medium text-primary underline dark:text-rose-300"
              onClick={() => { setError(''); setAttempt((previous) => previous + 1); }}>
              Thử lại với Google
            </button>
          )}
        </>
      )}
    </div>
  );
}
