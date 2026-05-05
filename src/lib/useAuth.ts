'use client';

import { useEffect, useState } from 'react';
import { clearTokens, isLoggedIn, MeResponse, auth as authApi } from './renoApi';

export function setSessionCookie() {
  document.cookie = 'reno_session=1; path=/; max-age=2592000; SameSite=Lax';
}

export function clearSessionCookie() {
  document.cookie = 'reno_session=; path=/; max-age=0';
}

export function logout() {
  clearTokens();
  clearSessionCookie();
  window.location.href = '/login';
}

export function useAuth() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(me => { setUser(me); setSessionCookie(); })
      .catch(() => { clearTokens(); clearSessionCookie(); })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, isLoggedIn: !!user };
}
