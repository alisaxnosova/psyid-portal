'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { saveTokens } from '@/lib/renoApi';

const C = {
  blue: '#2244E0', orangeHot: '#FF9540', ink: '#0E1230',
  inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', paper: '#FBF7F1',
};

const iStyle: React.CSSProperties = {
  width: '100%', padding: '12px 15px', borderRadius: 12,
  border: `1.5px solid ${C.line}`, fontSize: 15, outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color .15s', color: C.ink,
};

function Logo() {
  return (
    <Link href="/" style={{ position: 'absolute', top: 28, left: 32, display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.03em' }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', position: 'relative', overflow: 'hidden', display: 'inline-block', flexShrink: 0 }}>
        <span style={{ position: 'absolute', left: 5, top: 5, width: 8, height: 8, borderRadius: '50%', background: C.blue }}/>
        <span style={{ position: 'absolute', right: 5, bottom: 5, width: 8, height: 8, borderRadius: 2, background: C.orangeHot }}/>
      </span>
      Psy<span style={{ color: C.orangeHot }}>ID</span>
    </Link>
  );
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', position: 'relative', isolation: 'isolate',
      background: 'linear-gradient(125deg, #050B36 0%, #0E1F6E 30%, #4B266A 55%, #B23A4C 75%, #FF823F 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse 60% 60% at 15% 85%, rgba(48,87,224,0.5) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 85% 15%, rgba(255,128,72,0.4) 0%, transparent 60%)' }}/>
      <Logo/>
      <div style={{ width: '100%', maxWidth: 440, background: C.paper, borderRadius: 28, padding: '44px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
        {children}
      </div>
    </div>
  );
}

// ── Step 1: registration form ────────────────────────────────────────────────

function StepForm({ onSent }: { onSent: (email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/client/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json() as { sent?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      onSent(email.trim());
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.blue, fontWeight: 700, marginBottom: 10 }}>
          PsyID · Psychological Passport
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 8px' }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: C.inkSoft, margin: 0, lineHeight: 1.55 }}>
          Free to start · 15-minute assessment · Instant results
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Your name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="What should we call you?" style={iStyle}
            onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.line)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required autoComplete="email" placeholder="you@example.com" style={iStyle}
            onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.line)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required autoComplete="new-password" placeholder="At least 8 characters" style={iStyle}
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
          {loading ? 'Sending code…' : 'Continue →'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: C.inkSoft }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: C.blue, fontWeight: 600 }}>Sign in</Link>
      </div>
    </>
  );
}

// ── Step 2: verification code entry ─────────────────────────────────────────

function StepVerify({ email, onBack }: { email: string; onBack: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/client/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json() as { tokens?: { accessToken: string; refreshToken: string; userId: string }; error?: string };
      if (!res.ok) {
        // If code expired or too many attempts, go back to form
        if (res.status === 400 && data.error?.includes('again')) {
          setError(data.error);
          setTimeout(() => onBack(), 2500);
        } else {
          setError(data.error ?? 'Verification failed.');
        }
        return;
      }
      if (data.tokens) {
        saveTokens(data.tokens);
        router.push('/portal');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setResent(false);
    setError('');
    try {
      await fetch('/api/client/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setCode('');
    } catch {
      setError('Could not resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        {/* Envelope icon */}
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.blue}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22,6 12,13 2,6" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 8px' }}>
          Check your inbox
        </h1>
        <p style={{ fontSize: 14, color: C.inkSoft, margin: 0, lineHeight: 1.55 }}>
          We sent a 6-digit code to{' '}
          <span style={{ color: C.ink, fontWeight: 600 }}>{email}</span>.
          Enter it below to confirm your email.
        </p>
      </div>

      <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: C.ink }}>Verification code</label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
            placeholder="000000"
            style={{
              ...iStyle,
              fontSize: 32, fontWeight: 800, letterSpacing: '0.25em',
              textAlign: 'center', fontFamily: "'Geist Mono', monospace",
              padding: '16px 15px',
            }}
            onFocus={e => (e.target.style.borderColor = C.blue)}
            onBlur={e => (e.target.style.borderColor = C.line)}
          />
        </div>

        {error && (
          <div style={{ padding: '11px 15px', borderRadius: 10, background: '#FEE2E2', color: '#DC2626', fontSize: 14, lineHeight: 1.4 }}>
            {error}
          </div>
        )}
        {resent && (
          <div style={{ padding: '11px 15px', borderRadius: 10, background: '#DCFCE7', color: '#16A34A', fontSize: 14 }}>
            New code sent! Check your inbox.
          </div>
        )}

        <button type="submit" disabled={loading || code.length < 6} style={{
          marginTop: 4, width: '100%', padding: '14px', borderRadius: 999,
          fontWeight: 700, fontSize: 15, cursor: (loading || code.length < 6) ? 'not-allowed' : 'pointer',
          border: 'none', fontFamily: 'inherit', color: '#fff',
          background: (loading || code.length < 6) ? '#bbb' : 'linear-gradient(95deg, #FF5C72, #FF8A45)',
          boxShadow: (loading || code.length < 6) ? 'none' : '0 10px 24px -8px rgba(255,100,80,.5)',
        }}>
          {loading ? 'Verifying…' : 'Verify email →'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, fontSize: 14 }}>
        <button onClick={onBack} style={{ color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 14 }}>
          ← Change email
        </button>
        <button onClick={resend} disabled={resending} style={{ color: C.blue, fontWeight: 600, background: 'none', border: 'none', cursor: resending ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 14 }}>
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [pendingEmail, setPendingEmail] = useState('');

  return (
    <PageWrap>
      {step === 'form'
        ? <StepForm onSent={email => { setPendingEmail(email); setStep('verify'); }} />
        : <StepVerify email={pendingEmail} onBack={() => setStep('form')} />
      }
    </PageWrap>
  );
}
