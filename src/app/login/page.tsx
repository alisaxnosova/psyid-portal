'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, saveTokens } from '@/lib/renoApi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await auth.login(email, password);
      saveTokens(tokens);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-2)', padding: 24,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 48 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Добро пожаловать</div>
          <h1 className="serif" style={{ fontSize: 36, letterSpacing: '-0.025em' }}>Войти в PsyID</h1>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink-2)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '2px solid var(--line)', fontSize: 15,
                outline: 'none', background: 'white', boxSizing: 'border-box',
                transition: 'border-color .2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--violet)')}
              onBlur={e => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--ink-2)' }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '2px solid var(--line)', fontSize: 15,
                outline: 'none', background: 'white', boxSizing: 'border-box',
                transition: 'border-color .2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--violet)')}
              onBlur={e => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: '#FEE2E2', color: '#DC2626', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-3)' }}>
          Нет аккаунта?{' '}
          <Link href="/register" style={{ color: 'var(--violet)', fontWeight: 600 }}>
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
