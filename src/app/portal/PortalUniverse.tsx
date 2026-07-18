'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { logout } from '@/lib/useAuth';
import { useSiteLang } from '@/lib/siteLang';
import { Mark } from '@/components/shared/Mark';
import { Starfield } from '@/components/galaxy';
import { GalaxyCanvas } from '@/components/galaxy/GalaxyCanvas';
import {
  AXES, axisView, bandFromScore, BAND_WORDS, codeOf, buildGraph,
  type Profile, type ModuleDef,
} from '@/components/galaxy/model';

type Bi = { en: string; ru?: string };

interface UniSession { id: string; no: number; date: string; dateISO: string; code: string; profile: Profile; legacy: boolean; latest: boolean }
interface UniverseData { hasResult: boolean; name: string; accessCode: string; code: string | null; profile: Profile | null; sessions: UniSession[] }

// Portal modules (constellations). Two unlocked demo modules + two locked.
const MODULES: (ModuleDef & { name: Bi; sub: Bi; desc: Bi; done?: Bi; top?: string[]; cta?: Bi })[] = [
  { key: 'riasec', axis: 1, locked: false, name: { en: 'Interests' }, sub: { en: 'RIASEC' },
    done: { en: 'Completed' }, top: ['A', 'I', 'S'],
    desc: { en: 'Your interests lean creative and investigative: to make, to study, to help people grow.' } },
  { key: 'values', axis: 2, locked: false, name: { en: 'Values' }, sub: { en: 'at work' },
    done: { en: 'Completed' }, top: ['Autonomy', 'Meaning', 'Mastery'],
    desc: { en: 'What matters most: freedom in how you work, a sense of meaning, and growing mastery. Money and status come second.' } },
  { key: 'burnout', axis: 4, locked: true, name: { en: 'Energy' }, sub: { en: '& burnout' },
    desc: { en: 'How you spend and restore energy, your early burnout signals, and what truly recharges you.' },
    cta: { en: 'Take the mini-test · 5 min' } },
  { key: 'team', axis: 3, locked: true, name: { en: 'Style' }, sub: { en: 'in a team' },
    desc: { en: 'How you plug into shared work, your natural role, and which types you click or clash with.' },
    cta: { en: 'Take the mini-test · 7 min' } },
];

const STAGES: { n: string; name: Bi; locked: boolean }[] = [
  { n: '01', name: { en: 'Your universe' }, locked: false },
  { n: '02', name: { en: 'Find directions' }, locked: false },
  { n: '03', name: { en: 'Test in reality' }, locked: true },
  { n: '04', name: { en: 'People & teams' }, locked: true },
  { n: '05', name: { en: 'Track growth' }, locked: true },
];

export default function PortalUniverse({ data }: { data: UniverseData }) {
  const { lang, t } = useSiteLang();
  const L = (b: Bi) => b[lang];

  const profile = data.profile!;
  const [view, setView] = useState<'dna' | 'directions'>('dna');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [grabbed, setGrabbed] = useState(false);

  // arrival overlay — first visit only (or ?replay)
  const [arrived, setArrived] = useState(true);
  useEffect(() => {
    const replay = new URLSearchParams(window.location.search).has('replay');
    const seen = localStorage.getItem('psyid_dna_seen') === '1';
    setArrived(seen && !replay);
  }, []);
  function enterUniverse() {
    localStorage.setItem('psyid_dna_seen', '1');
    setArrived(true);
  }

  const graph = useMemo(() => buildGraph(profile, {
    modules: MODULES.map((m) => ({ key: m.key, axis: m.axis, locked: m.locked })),
    sessions: data.sessions.length || 1,
    pentagonWeb: true,
  }), [profile, data.sessions.length]);

  function onPick(id: string) { setFocusId(id); if (!grabbed) setGrabbed(true); }
  const focusNode = focusId ? graph.nodes.find((n) => n.id === focusId) ?? null : null;

  const code = data.code ?? codeOf(profile);

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--portal-bg)', color: 'var(--space-fg)', overflow: 'hidden' }}>
      {/* top nav */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 26px', borderBottom: '1px solid var(--space-brd)', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/"><Mark tone="dark" size={60} /></Link>
          <span style={{ width: 1, height: 20, background: 'var(--space-brd)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--space-fg-m)' }}>{L({ en: 'Your universe' })}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={logout} title="Sign out" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, background: 'linear-gradient(135deg,#2244E0,#FF5A5A)' }}>
            {(data.name || 'PS').slice(0, 2).toUpperCase()}
          </button>
        </div>
      </header>

      {/* body */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {view === 'dna' ? (
          <>
            <Starfield count={130} />
            <GalaxyCanvas
              graph={graph}
              interactive
              palette="chrome"
              showLabels="key"
              glow={1}
              centerY={0.42}
              onPick={onPick}
              focusId={focusId}
              resetKey={resetKey}
            />

            {/* hero caption (top-right) */}
            <div className={focusNode ? 'dim-chrome' : ''} style={{ position: 'absolute', top: 24, right: 26, maxWidth: 300, textAlign: 'right', pointerEvents: 'none', zIndex: 5, transition: 'opacity .3s', opacity: focusNode ? 0.1 : 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 8 }}>— {L({ en: 'Your personal universe' })} —</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 27, letterSpacing: '-.03em', lineHeight: 1.05, marginBottom: 10 }}>{L({ en: 'You are a whole universe' })}</h1>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--space-fg-s)', marginBottom: 12 }}>{L({ en: 'Five axes of character at the core. Modules and constellations of scores orbit around them — each test lights a new star.' })}</p>
              <span className="code-pill" style={{ pointerEvents: 'auto' }}>{code}</span>
            </div>

            {/* legend + hint */}
            <div className={focusNode ? 'dim-chrome' : ''} style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 5, transition: 'opacity .3s', opacity: focusNode ? 0.1 : 1, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 'var(--r-full)', border: '1px solid var(--space-brd)', background: 'var(--space-panel)', backdropFilter: 'blur(14px)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[[L({ en: 'axes' }), 'var(--ax1)'], [L({ en: 'modules' }), 'var(--ax3)'], [L({ en: 'scores' }), 'var(--gold)'], [L({ en: 'not yet open' }), 'var(--space-fg-m)']].map(([label, c]) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--space-fg-s)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{label}
                </span>
              ))}
              <span style={{ width: 1, height: 14, background: 'var(--space-brd)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--space-fg-m)' }}>{L({ en: 'drag · wheel to zoom · tap a star' })}</span>
            </div>

            {/* grab hint */}
            {!grabbed && !focusNode && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 4, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.1em', color: 'var(--space-fg-m)', pointerEvents: 'none', animation: 'fadeInUp .6s ease' }}>
                {L({ en: 'drag to spin' })}
              </div>
            )}

            {/* reset */}
            {grabbed && (
              <button onClick={() => { setResetKey((k) => k + 1); setGrabbed(false); setFocusId(null); }} style={{ position: 'absolute', bottom: 20, right: 26, zIndex: 6, padding: '9px 14px', borderRadius: 'var(--r-full)', border: '1px solid var(--space-brd)', background: 'var(--space-panel)', color: 'var(--space-fg-s)', fontSize: 12, cursor: 'pointer', backdropFilter: 'blur(14px)' }}>
                ↺ {L({ en: 'reset view' })}
              </button>
            )}

            {focusNode && <DetailCard node={focusNode} profile={profile} sessions={data.sessions} onClose={() => setFocusId(null)} L={L} lang={lang} />}
          </>
        ) : (
          <Directions profile={profile} onBack={() => setView('dna')} L={L} lang={lang} t={t} />
        )}

        {/* stage rail (left) */}
        {view !== 'directions' && (
          <nav className="portal-rail" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STAGES.map((st, i) => {
              const active = (i === 0 && view === 'dna');
              return (
                <button key={st.n} disabled={st.locked} onClick={() => { if (st.n === '02') setView('directions'); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 13, cursor: st.locked ? 'default' : 'pointer', textAlign: 'left',
                  border: '1px solid', borderColor: active ? 'var(--space-brd)' : 'transparent',
                  background: active ? 'var(--space-panel)' : 'transparent', backdropFilter: active ? 'blur(14px)' : 'none',
                  color: st.locked ? 'var(--space-fg-m)' : 'var(--space-fg-s)', opacity: st.locked ? 0.45 : 1,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: active ? 'var(--orange)' : 'inherit' }}>{st.n}</span>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{L(st.name)}</span>
                  {st.locked && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--space-fg-m)', marginLeft: 'auto' }}>{L({ en: 'soon' })}</span>}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* arrival overlay */}
      {!arrived && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, background: 'var(--portal-bg)', animation: 'fadeInUp .5s ease' }}>
          <Starfield count={80} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}><Mark tone="dark" size={104} wordmark={false} /></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 16 }}>— {L({ en: 'Test complete · universe built' })} —</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(34px,6vw,54px)', letterSpacing: '-.04em', lineHeight: 1.02, marginBottom: 16 }}>{L({ en: 'You are a whole universe' })}</h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--space-fg-s)', marginBottom: 28 }}>
              {L({ en: 'We gathered your personality into a single object: five axes at the core, constellations of scores and modules around them. Your code is ' })}
              <span className="code-pill">{code}</span>.
            </p>
            <button className="btn btn-orange" onClick={enterUniverse} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: 'none', cursor: 'pointer', color: '#fff', padding: '16px 34px', borderRadius: 999, fontWeight: 600, fontSize: 16, background: 'linear-gradient(135deg,#FF7A3D,#FF5A5A)' }}>
              {L({ en: 'Enter your universe' })} →
            </button>
            <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--space-fg-m)' }}>{L({ en: 'drag to spin · tap a star to learn more' })}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Node detail card ── */
function DetailCard({ node, profile, sessions, onClose, L, lang }: {
  node: NonNullable<ReturnType<typeof buildGraph>['nodes'][number]>;
  profile: Profile; sessions: UniSession[]; onClose: () => void; L: (b: Bi) => string; lang: 'ru' | 'en';
}) {
  let body: React.ReactNode = null;

  if (node.type === 'center') {
    body = (
      <>
        <div style={{ ...eyebrow, color: '#fff' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px #fff' }} /> {L({ en: 'core · this is you' })}</div>
        <h3 style={cardH}>{L({ en: 'The core of your universe' })}</h3>
        <div style={monoCode}>{codeOf(profile)}</div>
        <p style={cardBody}>{L({ en: 'Your code across five axes. The further a planet sits from the center, the stronger that trait.' })}</p>
      </>
    );
  } else if (node.type === 'core' && node.axisIndex != null) {
    const v = axisView(profile[node.axisIndex], node.axisIndex, lang);
    const thumb = Math.min(96, 50 + v.score * 0.46);
    body = (
      <>
        <div style={{ ...eyebrow, color: v.hue }}>{L({ en: 'axis' })} · {v.en}</div>
        <h3 style={cardH}>{v.name}</h3>
        <div style={{ ...cardSub }}>{L({ en: 'pole' })} «{v.poleName}» · {v.code}</div>
        <p style={cardBody}>{v.body}</p>
        <div style={{ margin: '18px 0 8px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--space-fg-m)' }}>
          <span>{v.otherName}</span><span style={{ color: '#fff' }}>{v.poleName}</span>
        </div>
        <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'linear-gradient(90deg, rgba(150,170,255,.15), rgba(255,255,255,.35))' }}>
          <span style={{ position: 'absolute', top: '50%', left: `${thumb}%`, transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: '50%', background: '#fff', border: `3px solid ${v.hue}` }} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="code-pill" style={{ background: v.hue, borderColor: 'transparent', color: '#fff' }}>{v.code}</span>
          <span style={{ fontSize: 12.5, color: 'var(--space-fg-s)' }}>{v.bandWord} · {v.score} {L({ en: 'of 100 toward' })} «{v.poleName}»</span>
        </div>
        <div style={cardFoot}>{v.foot}</div>
      </>
    );
  } else if (node.type === 'module') {
    const mi = Number(node.id.split('-')[1]);
    const m = MODULES[mi];
    body = (
      <>
        <div style={{ ...eyebrow, color: node.color }}>{L({ en: 'module' })}</div>
        <h3 style={cardH}>{L(m.name)} · <span style={{ color: 'var(--space-fg-m)', fontWeight: 500 }}>{L(m.sub)}</span></h3>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: '4px 0 4px', padding: '5px 11px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', background: m.locked ? 'rgba(150,165,220,.14)' : 'rgba(90,200,120,.16)', color: m.locked ? 'var(--space-fg-m)' : '#7EE0A0' }}>
          {m.locked ? `🔒 ${L({ en: 'Not taken' })}` : `✓ ${L(m.done!)}`}
        </div>
        <p style={cardBody}>{L(m.desc)}</p>
        {!m.locked && m.top && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {m.top.map((c) => <span key={c} className="code-pill" style={{ fontSize: 12 }}>{c}</span>)}
          </div>
        )}
        {m.locked && m.cta && (
          <button className="btn btn-orange" style={{ marginTop: 16, border: 'none', cursor: 'pointer', color: '#fff', padding: '11px 20px', borderRadius: 999, fontWeight: 600, background: 'linear-gradient(135deg,#FF7A3D,#FF5A5A)' }}>{L(m.cta)}</button>
        )}
      </>
    );
  } else if (node.type === 'session') {
    const si = Number(node.id.split('-')[1]);
    const s = sessions[si];
    body = (
      <>
        <div style={{ ...eyebrow, color: 'var(--gold)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} /> {s?.latest ? L({ en: 'Latest assessment' }) : `${L({ en: 'Assessment №' })}${s?.no ?? si + 1}`}</div>
        <h3 style={cardH}>{s?.date ?? ''}</h3>
        <div style={monoCode}>{s?.code ?? ''}</div>
        <p style={cardBody}>{s?.legacy
          ? L({ en: 'An early assessment on the previous method. The fifth axis (emotion) was not yet measured.' })
          : L({ en: 'A snapshot of your universe on this date. Compare it with the core to see what shifted.' })}</p>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 10, backdropFilter: 'blur(7px)', background: 'rgba(4,6,20,.35)' }} />
      <div style={{ position: 'absolute', zIndex: 11, right: 'clamp(16px,4vw,40px)', top: '50%', transform: 'translateY(-50%)', width: 'min(400px, calc(100% - 32px))', padding: 30, borderRadius: 22, border: '1px solid var(--space-brd)', background: 'rgba(16,22,52,.7)', backdropFilter: 'blur(30px) saturate(160%)', animation: 'fadeInUp .4s ease' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--space-brd)', background: 'transparent', color: 'var(--space-fg-s)', cursor: 'pointer' }}>✕</button>
        {body}
      </div>
    </>
  );
}

const eyebrow: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 12 };
const cardH: React.CSSProperties = { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.03em', color: '#fff', marginBottom: 4 };
const cardSub: React.CSSProperties = { fontSize: 13, color: 'var(--space-fg-s)', marginBottom: 12 };
const cardBody: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.6, color: 'var(--space-fg-s)', marginTop: 8 };
const cardFoot: React.CSSProperties = { marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--space-brd)', fontSize: 12.5, color: 'var(--space-fg-m)' };
const monoCode: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, letterSpacing: '.04em', color: 'var(--space-fg)', margin: '6px 0' };

/* ── Stage 02 — directions ── */
function Directions({ profile, onBack, L, lang, t }: { profile: Profile; onBack: () => void; L: (b: Bi) => string; lang: 'ru' | 'en'; t: (k: string) => string }) {
  const MATCHES: { name: Bi; fit: number; tag: string; why: Bi; chips: string[] }[] = [
    { name: { en: 'Writer / screenwriter' }, fit: 91, tag: 'A · I', why: { en: 'Abstraction and values-led decisions are about meaning and story. A flexible mode gives room to grow an idea.' }, chips: ['A4', 'F4', 'V3'] },
    { name: { en: 'UX researcher' }, fit: 86, tag: 'I · A', why: { en: 'Quiet attentiveness and whole-picture thinking help you see what drives people.' }, chips: ['A4', 'W2', 'S2'] },
    { name: { en: 'Product designer' }, fit: 82, tag: 'A · E', why: { en: 'You hold the whole picture and decide by values — products "for people".' }, chips: ['A4', 'V3', 'F4'] },
    { name: { en: 'Psychologist / coach' }, fit: 80, tag: 'S · I', why: { en: 'Depth, empathy and calm under load. One-on-one work is your environment.' }, chips: ['S2', 'W2', 'V3'] },
    { name: { en: 'Researcher / R&D' }, fit: 78, tag: 'I · A', why: { en: 'Curiosity for the abstract and tolerance for uncertainty.' }, chips: ['A4', 'F4', 'W2'] },
    { name: { en: 'Curator / editor' }, fit: 74, tag: 'A · C', why: { en: 'A sense of the whole and a taste for meaning.' }, chips: ['A4', 'V3', 'F4'] },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: 'clamp(24px,5vw,56px)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'var(--space-fg-s)', cursor: 'pointer', fontSize: 13, marginBottom: 20 }}>← {L({ en: 'To the DNA' })}</button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: 14 }}>— {L({ en: 'Stage 02 · Find directions' })} —</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,4vw,44px)', letterSpacing: '-.035em', marginBottom: 14 }}>{L({ en: 'Professions where you are in your element' })}</h2>
        <p style={{ fontSize: 16, color: 'var(--space-fg-s)', maxWidth: '60ch', marginBottom: 32 }}>{L({ en: 'Directions built from your profile: RIASEC × PsyID. The number is how far the environment fits your nature.' })}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {MATCHES.map((m, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 20, border: '1px solid var(--space-brd)', background: 'var(--space-panel)', backdropFilter: 'blur(14px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{L(m.name)}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--space-fg-m)', marginTop: 3 }}>{m.tag}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-.03em', background: 'linear-gradient(135deg,#2244E0,#FF5A5A)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>{m.fit}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--space-fg-m)' }}>{L({ en: 'fit' })}</div>
                </div>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: 'rgba(150,170,255,.15)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${m.fit}%`, background: 'linear-gradient(90deg,#2244E0,#FF5A5A)' }} />
              </div>
              <p style={{ fontSize: 14, color: 'var(--space-fg-s)', lineHeight: 1.55 }}>{L(m.why)}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                {m.chips.map((c) => <span key={c} className="code-pill" style={{ fontSize: 11 }}>{c}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, padding: 24, borderRadius: 20, border: '1px solid var(--space-brd)', background: 'var(--space-panel)' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{L({ en: 'A direction is a hypothesis, not a verdict' })}</div>
          <p style={{ fontSize: 14, color: 'var(--space-fg-s)', lineHeight: 1.55 }}>{L({ en: "A high fit means it's easier to be yourself; a low one means the environment asks more effort — but it doesn't close the door." })}</p>
        </div>
        <div style={{ marginTop: 24 }}>
          <Link className="btn btn-orange" href="/reno" style={{ display: 'inline-flex', color: '#fff', padding: '13px 24px', borderRadius: 999, fontWeight: 600, background: 'linear-gradient(135deg,#FF7A3D,#FF5A5A)' }}>{t('nav_cta')} →</Link>
        </div>
      </div>
    </div>
  );
}
