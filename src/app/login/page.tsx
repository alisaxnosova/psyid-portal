'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { auth, saveTokens } from '@/lib/renoApi';
import { Mark } from '@/components/shared/Mark';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const accountExists = params.get('hint') === 'exists';
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
      router.push('/portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="psid-site">
      <div className="auth-wrap grad-ground">
        <Link href="/" className="auth-logo" aria-label="PsyID home"><Mark tone="dark" /></Link>
        <div className="auth-card">
          <div className="auth-head">
            <div className="eyebrow blue" style={{ marginBottom: 12 }}>PsyID · ReNo 2.0</div>
            <h1>Welcome back</h1>
            <p className="auth-sub">Sign in to enter your universe and results.</p>
          </div>

          {accountExists && (
            <div className="auth-info" style={{ marginBottom: 16 }}>
              An account with that email already exists — sign in below.
            </div>
          )}

          <form onSubmit={submit} className="auth-form">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
            </div>
            <div className="field">
              <div className="field-row">
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
            </div>

            {error && <div className="auth-err">{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-orange btn-full">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="auth-alt">
            Don&apos;t have an account? <Link href="/register">Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
