'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminAuth, saveAdminToken } from '@/lib/adminApi';
import { PsidLogo } from '@/components/landing/PsidLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Try local auth first (ADMIN_SECRET env var, no backend dependency)
      const localRes = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (localRes.ok) {
        const { accessToken } = await localRes.json() as { accessToken: string };
        saveAdminToken(accessToken);
        router.push('/admin');
        return;
      }
      // Fall back to backend auth
      const { accessToken } = await adminAuth.login(email, password);
      saveAdminToken(accessToken);
      router.push('/admin');
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="psid-site">
      <div className="auth-wrap grad-ground">
        <Link href="/" className="auth-logo" aria-label="PsyID home"><PsidLogo white /></Link>
        <div className="auth-card">
          <div className="auth-head">
            <div className="eyebrow blue" style={{ marginBottom: 12 }}>PsyID · Admin panel</div>
            <h1>Admin sign in</h1>
            <p className="auth-sub">Restricted access. Sign in with your admin credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus autoComplete="email" placeholder="you@psyid.me" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Your password" />
            </div>

            {error && <div className="auth-err">{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-orange btn-full">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="auth-alt">
            Not an admin? <Link href="/login">Client sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
