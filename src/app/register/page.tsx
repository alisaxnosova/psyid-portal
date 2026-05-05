'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { auth, saveTokens } from '@/lib/renoApi';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    setLoading(true);
    try {
      const tokens = await auth.register(email, password, name || undefined);
      saveTokens(tokens);
      if (attemptId) {
        router.push(`/results?id=${attemptId}`);
      } else {
        router.push('/test');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid var(--line)', fontSize: 15,
    outline: 'none', background: 'white', boxSizing: 'border-box',
    transition: 'border-color .2s',
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-2)', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 440, background: 'white',
        borderRadius: 24, padding: 48, border: '1px solid var(--line)',
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--violet)', marginBottom: 12 }}>
            {attemptId ? 'Сохранить паспорт' : 'Регистрация'}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 8 }}>
            {attemptId ? 'Сохраните психологический паспорт' : 'Создать аккаунт'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            {attemptId
              ? 'Зарегистрируйтесь и паспорт ребёнка сохранится в личном кабинете'
              : 'После регистрации сразу начнёте тест — это бесплатно'}
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>
              Имя <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(необязательно)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Как вас зовут?"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--violet)')}
              onBlur={e => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--violet)')}
              onBlur={e => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Минимум 8 символов"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--violet)')}
              onBlur={e => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEE2E2', color: '#DC2626', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8, justifyContent: 'center' }}
          >
            {loading ? 'Создаём аккаунт...' : attemptId ? 'Сохранить и войти →' : 'Зарегистрироваться бесплатно →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-3)' }}>
          Уже есть аккаунт?{' '}
          <Link href="/login" style={{ color: 'var(--violet)', fontWeight: 600 }}>Войти</Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--ink-3)' }}>Загрузка...</span></div>}>
      <RegisterForm />
    </Suspense>
  );
}
