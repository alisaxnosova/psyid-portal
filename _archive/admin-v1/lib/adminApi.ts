const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/backend';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
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
    localStorage.removeItem('admin_access_token');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('admin_access_token');
}

export function adminLogout() {
  localStorage.removeItem('admin_access_token');
  document.cookie = 'admin_session=; path=/admin; max-age=0';
  window.location.href = '/admin/login';
}

export function saveAdminToken(token: string) {
  localStorage.setItem('admin_access_token', token);
  document.cookie = 'admin_session=1; path=/admin; max-age=86400; SameSite=Lax';
}

// Auth
export interface AdminTokenResponse {
  accessToken: string;
}

export const adminAuth = {
  login: (email: string, password: string) =>
    apiFetch<AdminTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Stats — GET /admin/stats
export interface AdminStats {
  totalUsers: number;
  totalAttempts: number;
  completedAttempts: number;
  todayUsers: number;
  todayAttempts: number;
  todayCompleted: number;
}

// Users — GET /admin/users
export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  firstName: string | null;
  createdAt: string;
  attemptsCount: number;
  completedCount: number;
}

// Results — GET /admin/attempts
export interface AdminAttempt {
  id: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  user: { id: string; email: string; fullName: string | null } | null;
  topProfile: string | null;
}

// Result detail — GET /admin/attempts/:id
export interface AdminAttemptDetail {
  id: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  user: { id: string; email: string; fullName: string | null } | null;
  dichotomyScores: {
    dichotomy: { code: string; title: string };
    dominantPoleCode: string;
    strengthPercent: number;
  }[];
  profileMatches: {
    profile: { code: string; title: string };
    matchPercent: number;
    rank: number;
  }[];
}

export const admin = {
  stats: () => apiFetch<AdminStats>('/admin/stats'),
  users: () => apiFetch<AdminUser[]>('/admin/users'),
  user: (id: string) => apiFetch<AdminUser & { attempts: AdminAttempt[] }>(`/admin/users/${id}`),
  attempts: () => apiFetch<AdminAttempt[]>('/admin/attempts'),
  attempt: (id: string) => apiFetch<AdminAttemptDetail>(`/admin/attempts/${id}`),
};
