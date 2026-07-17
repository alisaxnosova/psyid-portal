'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, logout } from '@/lib/useAuth';
import { useSiteLang } from '@/lib/siteLang';
import { Mark } from '@/components/shared/Mark';
import { Starfield } from '@/components/galaxy';
import PortalUniverse from './PortalUniverse';
import type { Profile } from '@/components/galaxy/model';

interface UniSession { id: string; no: number; date: string; dateISO: string; code: string; profile: Profile; legacy: boolean; latest: boolean }
interface UniverseData { hasResult: boolean; name: string; accessCode: string; code: string | null; profile: Profile | null; sessions: UniSession[] }

export default function PortalPage() {
  const { user, loading, isLoggedIn } = useAuth();
  const { lang, t } = useSiteLang();
  const L = (b: { en: string; ru?: string }) => b[lang];
  const router = useRouter();
  const [data, setData] = useState<UniverseData | null>(null);
  const [resLoading, setResLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (!loading && !isLoggedIn) router.push('/login'); }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('reno_access_token') : null;
    fetch('/api/client/universe', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: UniverseData | null) => setData(d))
      .catch(() => {})
      .finally(() => setResLoading(false));
  }, [isLoggedIn]);

  if (loading || (isLoggedIn && resLoading)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--portal-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--space-fg-m)', letterSpacing: '.1em' }}>{L({ en: 'Loading…' })}</div>
      </div>
    );
  }
  if (!isLoggedIn) return null;

  // Completed at least one assessment → the interactive universe.
  if (data?.hasResult && data.profile) return <PortalUniverse data={data} />;

  // No assessment yet → pre-assessment welcome (cosmic).
  const name = user?.fullName ?? user?.firstName ?? user?.email ?? '';
  function copyCode() {
    if (!user?.accessCode) return;
    navigator.clipboard.writeText(user.accessCode).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--portal-bg)', color: 'var(--space-fg)', position: 'relative', overflow: 'hidden' }}>
      <Starfield count={130} />
      <header style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', borderBottom: '1px solid var(--space-brd)' }}>
        <Link href="/"><Mark tone="dark" size={40} /></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 14, color: 'var(--space-fg-s)' }}>{user?.email}</span>
          <button onClick={logout} style={{ fontSize: 13, fontWeight: 600, color: 'var(--space-fg-s)', background: 'none', border: '1px solid var(--space-brd)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer' }}>{L({ en: 'Sign out' })}</button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 5, maxWidth: 900, margin: '0 auto', padding: '56px 28px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 12 }}>— {L({ en: 'Your universe awaits' })} —</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(30px,4vw,52px)', letterSpacing: '-.035em', marginBottom: 12 }}>
          {L({ en: 'Hello' })}{name ? `, ${name}` : ''}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--space-fg-s)', maxWidth: '54ch', marginBottom: 36 }}>
          {L({ en: "Take the test and we'll gather your personality into a living object: five axes at the core, with planets, moons and constellations around them. Your universe isn't built yet." })}
        </p>

        <div style={{ borderRadius: 24, padding: 'clamp(28px,4vw,44px)', border: '1px solid var(--space-brd)', background: 'var(--space-panel)', backdropFilter: 'blur(14px)', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--space-fg-m)', marginBottom: 12 }}>{L({ en: 'Assessment · 15 minutes' })}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2.5vw,32px)', letterSpacing: '-.03em', marginBottom: 20 }}>{L({ en: 'Build your universe' })}</h2>
          {user?.accessCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: '12px 18px', border: '1px solid var(--space-brd)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--space-fg-m)', marginBottom: 4 }}>{L({ en: 'Your access code' })}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 800, letterSpacing: '.18em' }}>{user.accessCode}</div>
              </div>
              <button onClick={copyCode} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--space-brd)', background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{copied ? L({ en: 'Copied!' }) : L({ en: 'Copy code' })}</button>
            </div>
          )}
          <Link className="btn btn-orange" href="/reno" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff', padding: '14px 26px', borderRadius: 999, fontWeight: 700, background: 'linear-gradient(135deg,#FF7A3D,#FF5A5A)' }}>{t('nav_cta')} →</Link>
        </div>
      </main>
    </div>
  );
}
