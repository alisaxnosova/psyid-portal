'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { auth, saveTokens } from '@/lib/renoApi';

const C = {
  blue: '#2244E0', orangeHot: '#FF9540', ink: '#0E1230',
  inkSoft: '#4F5470', line: '#E5DED2', paper: '#FBF7F1',
};

const iStyle: React.CSSProperties = {
  width: '100%', padding: '12px 15px', borderRadius: 12,
  border: `1.5px solid ${C.line}`, fontSize: 15, outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color .15s', color: C.ink,
};

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
    <div style={{
      minHeight: '100vh', position: 'relative', isolation: 'isolate',
      background: 'linear-gradient(125deg, #050B36 0%, #0E1F6E 30%, #4B266A 55%, #B23A4C 75%, #FF823F 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse 60% 60% at 15% 85%, rgba(48,87,224,0.5) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 85% 15%, rgba(255,128,72,0.4) 0%, transparent 60%)' }}/>

      <Link href="/" style={{ position: 'absolute', top: 28, left: 32, display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.03em' }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', position: 'relative', overflow: 'hidden', display: 'inline-block', flexShrink: 0 }}>
          <span style={{ position: 'absolute', left: 5, top: 5, width: 8, height: 8, borderRadius: '50%', background: C.blue }}/>
          <span style={{ position: 'absolute', right: 5, bottom: 5, width: 8, height: 8, borderRadius: 2, background: C.orangeHot }}/>
        </span>
        Psy<span style={{ color: C.orangeHot }}>ID</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 440, background: C.paper, borderRadius: 28, padding: '44px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.blue, fontWeight: 700, marginBottom: 10 }}>
            PsyID · Psychological Passport
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 8px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: C.inkSoft, margin: 0, lineHeight: 1.55 }}>
            Sign in to access your passport and results.
          </p>
        </div>

        {accountExists && (
          <div style={{ padding: '11px 15px', borderRadius: 10, background: '#EFF6FF', color: C.blue, fontSize: 14, lineHeight: 1.4, marginBottom: 20, border: `1px solid ${C.blue}22` }}>
            An account with that email already exists — sign in below.
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" placeholder="you@example.com" style={iStyle}
              onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.line)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password" placeholder="••••••••" style={iStyle}
              onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.line)} />
          </div>

          {error && (
            <div style={{ padding: '11px 15px', borderRadius: 10, background: '#FEE2E2', color: '#DC2626', fontSize: 14, lineHeight: 1.4 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 6, width: '100%', padding: '14px', borderRadius: 999,
            fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none', fontFamily: 'inherit', color: '#fff',
            background: loading ? '#bbb' : 'linear-gradient(95deg, #FF5C72, #FF8A45)',
            boxShadow: loading ? 'none' : '0 10px 24px -8px rgba(255,100,80,.5)',
          }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: C.inkSoft }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: C.blue, fontWeight: 600 }}>Sign up free</Link>
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
