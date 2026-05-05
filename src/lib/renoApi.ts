const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('reno_access_token');
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, init);
    }
    clearTokens();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem('reno_refresh_token');
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return false;
    const data: TokenResponse = await res.json();
    saveTokens(data);
    return true;
  } catch {
    return false;
  }
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface MeResponse {
  id: string;
  email: string;
  fullName: string | null;
  firstName: string | null;
  createdAt: string;
}

export function saveTokens(data: TokenResponse) {
  localStorage.setItem('reno_access_token', data.accessToken);
  localStorage.setItem('reno_refresh_token', data.refreshToken);
  localStorage.setItem('reno_user_id', data.userId);
  document.cookie = 'reno_session=1; path=/; max-age=2592000; SameSite=Lax';
}

export function clearTokens() {
  localStorage.removeItem('reno_access_token');
  localStorage.removeItem('reno_refresh_token');
  localStorage.removeItem('reno_user_id');
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('reno_access_token');
}

// Auth
export const auth = {
  register: (email: string, password: string, name?: string) =>
    apiFetch<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    apiFetch<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch<MeResponse>('/auth/me'),
};

// Methodologies
export interface MethodologyQuestion {
  id: string;
  code: string;
  text: string;
  order: number;
  options: { id: string; code: string; text: string; order: number }[];
}

export interface MethodologyData {
  id: string;
  code: string;
  title: string;
  currentVersion: {
    id: string;
    questions: MethodologyQuestion[];
  };
}

export const methodologies = {
  get: (code: string) => apiFetch<MethodologyData>(`/methodologies/${code}`),
};

// Attempts
export interface NextQuestion {
  attemptId: string;
  status: string;
  progress: { answered: number; total: number };
  question: {
    id: string;
    code: string;
    text: string;
    order: number;
    options: { id: string; code: string; text: string; order: number }[];
  } | null;
}

export interface AttemptResultSnapshot {
  keys: { keyCode: string; rawScore: number }[];
  dichotomies: {
    code: string;
    dominantPoleCode: string;
    strengthPercent: number;
    interpretationTitle: string | null;
    interpretationDescription: string | null;
  }[];
  profiles: { code: string | null; title: string | null; matchPercent: number; rank: number }[];
}

export interface AttemptResult {
  id: string;
  attemptId: string;
  status: string;
  completedAt: string | null;
  summary: string | null;
  renderedText: string | null;
  resultType: string | null;
  snapshot: AttemptResultSnapshot | null;
  dichotomyScores: {
    dichotomy: { code: string; title: string };
    dominantPoleCode: string;
    strengthPercent: number;
    leftRawScore: number;
    rightRawScore: number;
    interpretation: { title: string; description: string | null } | null;
  }[];
  profileMatches: {
    profile: { code: string; title: string; description: string | null };
    matchPercent: number;
    rank: number;
  }[];
}

export const attempts = {
  create: (methodologyCode: string, userId?: string | null) =>
    apiFetch<{ id: string; status: string }>('/attempts', {
      method: 'POST',
      body: JSON.stringify({ methodologyCode, ...(userId ? { userId } : {}) }),
    }),
  nextQuestion: (id: string) => apiFetch<NextQuestion>(`/attempts/${id}/next-question`),
  answer: (id: string, questionId: string, answerOptionId: string) =>
    apiFetch<{ saved: boolean; next: NextQuestion }>(`/attempts/${id}/answers`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answerOptionId }),
    }),
  complete: (id: string) =>
    apiFetch<AttemptResult>(`/attempts/${id}/complete`, { method: 'POST' }),
  result: (id: string) => apiFetch<AttemptResult>(`/attempts/${id}/result`),
  list: (userId: string) =>
    apiFetch<{ id: string; status: string; completedAt: string | null; createdAt: string }[]>(
      `/attempts?userId=${userId}`,
    ),
};
