'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, logout } from '@/lib/useAuth';

const C = {
  blue: '#2244E0', blueSoft: '#6A85F0', orangeHot: '#FF9540', coral: '#FF5A5A',
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', paper: '#FBF7F1', bone: '#F6F1EA',
};

export default function PortalPage() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login');
  }, [loading, isLoggedIn, router]);

  function copyCode() {
    if (!user?.accessCode) return;
    navigator.clipboard.writeText(user.accessCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: C.inkMute, letterSpacing: '0.1em' }}>Loading…</div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const displayName = user?.fullName ?? user?.firstName ?? user?.email ?? 'there';

  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>

      {/* ── Top nav ── */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: '#fff', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: C.ink }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: C.ink, position: 'relative', overflow: 'hidden', display: 'inline-block', flexShrink: 0 }}>
              <span style={{ position: 'absolute', left: 5, top: 5, width: 8, height: 8, borderRadius: '50%', background: C.blue }}/>
              <span style={{ position: 'absolute', right: 5, bottom: 5, width: 8, height: 8, borderRadius: 2, background: C.orangeHot }}/>
            </span>
            Psy<span style={{ color: C.orangeHot }}>ID</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 14, color: C.inkSoft }}>{user?.email}</span>
            {user?.accessCode && (
              <span style={{
                fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 800,
                letterSpacing: '0.12em', color: C.ink,
                background: C.bone, border: `1px solid ${C.line}`,
                borderRadius: 8, padding: '4px 10px',
              }}>
                {user.accessCode}
              </span>
            )}
            <button onClick={logout} style={{
              fontSize: 13, fontWeight: 600, color: C.inkSoft, background: 'none',
              border: `1px solid ${C.line}`, borderRadius: 999, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.blue, fontWeight: 700, marginBottom: 10 }}>
            Your Portal
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 8px' }}>
            Hello, {displayName} 👋
          </h1>
          <p style={{ fontSize: 16, color: C.inkSoft, margin: 0 }}>
            This is your PsyID portal — your assessment, results, and passport live here.
          </p>
        </div>

        {/* Take assessment banner */}
        <div style={{
          borderRadius: 24, padding: '40px 44px', marginBottom: 28, position: 'relative', overflow: 'hidden', isolation: 'isolate', color: '#fff',
          background: 'linear-gradient(125deg, #050B36 0%, #0E1F6E 35%, #4B266A 65%, #FF823F 100%)',
        }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse 55% 55% at 80% 50%, rgba(255,128,72,0.55) 0%, transparent 60%)' }}/>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>
            Assessment · 15 minutes
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
            Ready to discover who you are?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', margin: '0 0 24px', maxWidth: '52ch', lineHeight: 1.55 }}>
            A 15-minute scenario-based assessment that maps your 4 character axes and shows the careers where you&apos;ll naturally excel.
          </p>

          {user?.accessCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 20px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                  Your Access Code
                </div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 28, fontWeight: 900, letterSpacing: '0.18em', color: '#fff' }}>
                  {user.accessCode}
                </div>
              </div>
              <button onClick={copyCode} style={{
                padding: '10px 18px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.3)',
                background: codeCopied ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .15s',
              }}>
                {codeCopied ? 'Copied!' : 'Copy code'}
              </button>
            </div>
          )}

          <Link href="/reno" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999,
            padding: '13px 24px', fontWeight: 700, fontSize: 14, color: '#fff',
            background: 'linear-gradient(95deg, #FF5C72, #FF8A45)',
            boxShadow: '0 10px 24px -8px rgba(255,100,80,.55)',
          }}>
            Take the assessment ↗
          </Link>
        </div>

        {/* Results grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>

          {/* No results yet card */}
          <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 20, padding: '32px 28px' }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkMute, marginBottom: 12 }}>
              Assessment Results
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No results yet</div>
            <p style={{ fontSize: 14, color: C.inkSoft, margin: '0 0 20px', lineHeight: 1.55 }}>
              Complete the assessment to see your 4-axis profile, career directions, and strengths map.
            </p>
            <Link href="/reno" style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>
              Start assessment →
            </Link>
          </div>

          {/* Passport card */}
          <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 20, padding: '32px 28px' }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkMute, marginBottom: 12 }}>
              Psychological Passport
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Not yet generated</div>
            <p style={{ fontSize: 14, color: C.inkSoft, margin: '0 0 20px', lineHeight: 1.55 }}>
              Your 24-page passport is created after you complete the assessment. Digital version same day; print within a week.
            </p>
            <span style={{ fontSize: 14, color: C.inkMute }}>Available after assessment</span>
          </div>

          {/* Account card */}
          <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 20, padding: '32px 28px' }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkMute, marginBottom: 12 }}>
              Account
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
              {user?.fullName ?? user?.firstName ?? 'Your account'}
            </div>
            <p style={{ fontSize: 14, color: C.inkSoft, margin: '0 0 4px', lineHeight: 1.55 }}>
              {user?.email}
            </p>
            <p style={{ fontSize: 13, color: C.inkMute, margin: '0 0 20px' }}>
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </p>
            <button onClick={logout} style={{ fontSize: 14, fontWeight: 600, color: C.coral, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Sign out
            </button>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 80, padding: '24px 28px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.inkMute }}>
          © 2026 PsyID · <Link href="/" style={{ color: C.inkMute }}>Back to site</Link>
        </div>
      </footer>
    </div>
  );
}
