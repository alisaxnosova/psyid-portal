'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { saveTokens } from '@/lib/renoApi';
import { Mark } from '@/components/shared/Mark';

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="psid-site">
      <div className="auth-wrap grad-ground">
        <Link href="/" className="auth-logo" aria-label="PsyID home"><Mark tone="dark" /></Link>
        <div className="auth-card">{children}</div>
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
      <div className="auth-head">
        <div className="eyebrow blue" style={{ marginBottom: 12 }}>PsyID · ReNo 2.0</div>
        <h1>Create your account</h1>
        <p className="auth-sub">Free to start · a 15-minute assessment · your five-axis universe.</p>
      </div>

      <form onSubmit={submit} className="auth-form">
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="At least 8 characters" />
        </div>

        {error && <div className="auth-err">{error}</div>}

        <button type="submit" disabled={loading} className="btn btn-orange btn-full">
          {loading ? 'Sending code…' : 'Continue →'}
        </button>
      </form>

      <div className="auth-alt">
        Already have an account? <Link href="/login">Sign in</Link>
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
        if (res.status === 409 && data.error === 'account_exists') {
          router.push('/login?hint=exists');
          return;
        }
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
      <div className="auth-head">
        <div className="auth-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#2244E0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="22,6 12,13 2,6" stroke="#2244E0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>Check your inbox</h1>
        <p className="auth-sub">We sent a 6-digit code to <b>{email}</b>. Enter it below to confirm your email.</p>
      </div>

      <form onSubmit={verify} className="auth-form">
        <div className="field">
          <label htmlFor="code">Verification code</label>
          <input
            id="code"
            ref={inputRef}
            className="code-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
            placeholder="000000"
          />
        </div>

        {error && <div className="auth-err">{error}</div>}
        {resent && <div className="auth-ok">New code sent! Check your inbox.</div>}

        <button type="submit" disabled={loading || code.length < 6} className="btn btn-orange btn-full">
          {loading ? 'Verifying…' : 'Verify email →'}
        </button>
      </form>

      <div className="auth-row">
        <button className="back" onClick={onBack}>← Change email</button>
        <button className="resend" onClick={resend} disabled={resending}>{resending ? 'Sending…' : 'Resend code'}</button>
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
