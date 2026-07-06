'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/client/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Something went wrong.');
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/client/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');
      setStep('done');
      setTimeout(() => router.push('/login'), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  }

  const focus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = C.blue);
  const blur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = C.line);

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
        {step === 'done' ? (
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 8px' }}>Password updated ✓</h1>
            <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
              You can now sign in with your new password. Taking you to the login page…
            </p>
            <Link href="/login" style={{ display: 'inline-block', marginTop: 20, color: C.blue, fontWeight: 600, fontSize: 14 }}>Go to login →</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.blue, fontWeight: 700, marginBottom: 10 }}>
                PsyID · Password reset
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 8px' }}>
                {step === 'email' ? 'Forgot your password?' : 'Enter your code'}
              </h1>
              <p style={{ fontSize: 14, color: C.inkSoft, margin: 0, lineHeight: 1.55 }}>
                {step === 'email'
                  ? 'Enter your email and we’ll send you a code to reset it.'
                  : `We sent a 6-digit code to ${email}. Enter it below with your new password.`}
              </p>
            </div>

            {step === 'email' ? (
              <form onSubmit={requestCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                    placeholder="you@example.com" style={iStyle} onFocus={focus} onBlur={blur} />
                </div>
                {error && <div style={{ padding: '11px 15px', borderRadius: 10, background: '#FEE2E2', color: '#DC2626', fontSize: 14 }}>{error}</div>}
                <button type="submit" disabled={loading} style={btn(loading)}>{loading ? 'Sending…' : 'Send reset code →'}</button>
              </form>
            ) : (
              <form onSubmit={submitReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Reset code</label>
                  <input inputMode="numeric" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required placeholder="123456" style={{ ...iStyle, letterSpacing: '0.3em', fontFamily: "'Geist Mono', monospace" }} onFocus={focus} onBlur={blur} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>New password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password"
                    placeholder="At least 8 characters" style={iStyle} onFocus={focus} onBlur={blur} />
                </div>
                {error && <div style={{ padding: '11px 15px', borderRadius: 10, background: '#FEE2E2', color: '#DC2626', fontSize: 14 }}>{error}</div>}
                <button type="submit" disabled={loading} style={btn(loading)}>{loading ? 'Updating…' : 'Set new password →'}</button>
                <button type="button" onClick={() => { setStep('email'); setError(''); }} style={{ background: 'none', border: 'none', color: C.inkSoft, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ← Use a different email
                </button>
              </form>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: C.inkSoft }}>
          Remembered it?{' '}
          <Link href="/login" style={{ color: C.blue, fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

function btn(loading: boolean): React.CSSProperties {
  return {
    marginTop: 6, width: '100%', padding: '14px', borderRadius: 999,
    fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
    border: 'none', fontFamily: 'inherit', color: '#fff',
    background: loading ? '#bbb' : 'linear-gradient(95deg, #FF5C72, #FF8A45)',
    boxShadow: loading ? 'none' : '0 10px 24px -8px rgba(255,100,80,.5)',
  };
}
