'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminApi';
import {
  ALL_TYPES, flattenOccupations, occupationsByType, makeId,
  type Sphere, type Occupation, type OccRef, type TypeCode,
} from '@/lib/career-vault/types';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A', blue: '#2244E0', green: '#1DA36A',
  violet: '#4B1E8E', purple: '#7B3FBE',
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

// Type badge — color-coded by temperament family, matching the Results page.
function typeColor(t: string): string {
  if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(t)) return C.violet;
  if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(t)) return C.purple;
  if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(t)) return C.blue;
  return C.inkSoft; // SP types
}

function TypeBadge({ t, dim }: { t: string; dim?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px', borderRadius: 6,
      background: dim ? 'transparent' : typeColor(t),
      border: dim ? `1.5px solid ${typeColor(t)}` : 'none',
      color: dim ? typeColor(t) : 'white',
      fontFamily: "'Geist Mono', monospace", fontSize: 11, fontWeight: 800, letterSpacing: '0.04em',
    }}>{t}</span>
  );
}

function occMatches(occ: Occupation, q: string): boolean {
  if (!q) return true;
  const ql = q.toLowerCase();
  return occ.name.toLowerCase().includes(ql)
    || (occ.specializations ?? []).some(s => s.toLowerCase().includes(ql))
    || occ.personality.mbti_fit.high.some(t => t.toLowerCase().includes(ql));
}

// ─── Occupation row ───────────────────────────────────────────────────────────

function OccRow({ occ, onEdit, showPath, path }: {
  occ: Occupation; onEdit: () => void; showPath?: boolean; path?: string;
}) {
  const p = occ.personality;
  return (
    <div
      onClick={onEdit}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
        borderBottom: `1px solid ${C.bone}`, cursor: 'pointer', transition: 'background .1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{occ.name}</div>
        {showPath && path && (
          <div style={{ fontSize: 11, color: C.inkMute, fontFamily: "'Geist Mono', monospace", marginTop: 2 }}>{path}</div>
        )}
        {occ.specializations?.length ? (
          <div style={{ fontSize: 11, color: C.inkMute, marginTop: 2 }}>{occ.specializations.length} specialization{occ.specializations.length !== 1 ? 's' : ''}</div>
        ) : null}
      </div>
      {p.function_pair && (
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, fontWeight: 700, color: C.inkMute, padding: '2px 7px', borderRadius: 6, background: C.bone }}>{p.function_pair}</span>
      )}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: '2 1 260px', justifyContent: 'flex-end' }}>
        {p.mbti_fit.high.map(t => <TypeBadge key={t} t={t} />)}
        {p.mbti_fit.moderate.map(t => <TypeBadge key={t} t={t} dim />)}
      </div>
    </div>
  );
}

// ─── Occupation editor (drawer) ─────────────────────────────────────────────────

type EditTarget = { industryId: string; fnId: string; occ: Occupation; isNew: boolean };

function Editor({ target, onCancel, onSave, onDelete }: {
  target: EditTarget;
  onCancel: () => void;
  onSave: (occ: Occupation) => void;
  onDelete: () => void;
}) {
  const [name, setName]       = useState(target.occ.name);
  const [pair, setPair]       = useState(target.occ.personality.function_pair ?? '');
  const [high, setHigh]       = useState<string[]>(target.occ.personality.mbti_fit.high);
  const [moderate, setMod]    = useState<string[]>(target.occ.personality.mbti_fit.moderate);
  const [specs, setSpecs]     = useState((target.occ.specializations ?? []).join(', '));

  // Cycle a type through: none → high → moderate → none
  const cycle = (t: TypeCode) => {
    if (high.includes(t)) { setHigh(high.filter(x => x !== t)); setMod([...moderate, t]); }
    else if (moderate.includes(t)) { setMod(moderate.filter(x => x !== t)); }
    else { setHigh([...high, t]); }
  };
  const stateOf = (t: TypeCode): 'high' | 'moderate' | 'none' =>
    high.includes(t) ? 'high' : moderate.includes(t) ? 'moderate' : 'none';

  const save = () => {
    if (!name.trim()) return;
    onSave({
      ...target.occ,
      id: target.occ.id || makeId(name),
      name: name.trim(),
      personality: {
        ...target.occ.personality,
        function_pair: pair.trim() || undefined,
        mbti_fit: { high, moderate },
      },
      specializations: specs.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,48,0.35)' }} />
      <div style={{
        position: 'relative', width: 'min(520px, 100%)', height: '100%', background: 'white',
        boxShadow: '-8px 0 40px rgba(14,18,48,0.18)', padding: '28px 28px 100px', overflowY: 'auto',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
          {target.isNew ? 'New occupation' : 'Edit occupation'}
        </div>

        <label style={{ display: 'block', marginTop: 18, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Family Physician"
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink, background: C.bone, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />

        <label style={{ display: 'block', marginTop: 16, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Function pair (internal)</label>
        <input value={pair} onChange={e => setPair(e.target.value)} placeholder="e.g. SF"
          style={{ width: 120, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink, background: C.bone, outline: 'none', fontFamily: "'Geist Mono', monospace", boxSizing: 'border-box' }} />

        <label style={{ display: 'block', marginTop: 18, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 4 }}>Personality fit (ranked)</label>
        <div style={{ fontSize: 11, color: C.inkMute, marginBottom: 10 }}>
          Click to cycle: <b style={{ color: C.green }}>High</b> → <b style={{ color: C.orangeHot }}>Moderate</b> → off
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {ALL_TYPES.map(t => {
            const st = stateOf(t);
            const bg = st === 'high' ? C.green : st === 'moderate' ? C.orangeHot : 'white';
            const col = st === 'none' ? C.inkMute : 'white';
            return (
              <button key={t} onClick={() => cycle(t)} style={{
                padding: '8px 0', borderRadius: 8, border: `1.5px solid ${st === 'none' ? C.line : bg}`,
                background: bg, color: col, fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 800,
                cursor: 'pointer', transition: 'all .1s',
              }}>{t}</button>
            );
          })}
        </div>

        <label style={{ display: 'block', marginTop: 18, fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Specializations (comma-separated)</label>
        <textarea value={specs} onChange={e => setSpecs(e.target.value)} rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 13, color: C.ink, background: C.bone, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />

        {/* Actions */}
        <div style={{ position: 'fixed', bottom: 0, right: 0, width: 'min(520px, 100%)', padding: '16px 28px', background: 'white', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={save} disabled={!name.trim()} style={{
            padding: '11px 22px', borderRadius: 11, border: 'none', background: name.trim() ? C.violet : C.line,
            color: 'white', fontSize: 13, fontWeight: 800, cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>Save</button>
          <button onClick={onCancel} style={{
            padding: '11px 18px', borderRadius: 11, border: `1.5px solid ${C.line}`, background: 'white',
            color: C.inkSoft, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          {!target.isNew && (
            <button onClick={onDelete} style={{
              marginLeft: 'auto', padding: '11px 16px', borderRadius: 11, border: `1.5px solid rgba(255,90,90,0.3)`,
              background: 'white', color: C.coral, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function CareerVaultPage() {
  const router = useRouter();
  const [spheres, setSpheres]   = useState<Sphere[]>([]);
  const [sphereId, setSphereId] = useState<string>('');
  const [view, setView]         = useState<'cluster' | 'type'>('cluster');
  const [search, setSearch]     = useState('');
  const [selType, setSelType]   = useState<TypeCode | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [edit, setEdit]         = useState<EditTarget | null>(null);
  const [addPlace, setAddPlace] = useState(false); // show "add" placement picker

  useEffect(() => { if (!isAdminLoggedIn()) router.push('/admin/login'); }, [router]);

  useEffect(() => {
    const token = getToken();
    fetch('/api/admin/career-vault', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then((d: { spheres?: Sphere[]; error?: string }) => {
        if (d.error) throw new Error(d.error);
        setSpheres(d.spheres ?? []);
        if (d.spheres?.length) setSphereId(d.spheres[0].id);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sphere = useMemo(() => spheres.find(s => s.id === sphereId) ?? null, [spheres, sphereId]);

  const persist = async (next: Sphere) => {
    setSpheres(prev => prev.map(s => s.id === next.id ? next : s));
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/admin/career-vault', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      setError('Save failed: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const applyOcc = (industryId: string, fnId: string, occ: Occupation, remove = false) => {
    if (!sphere) return;
    const next: Sphere = {
      ...sphere,
      industries: sphere.industries.map(ind => ind.id !== industryId ? ind : {
        ...ind,
        functions: ind.functions.map(fn => fn.id !== fnId ? fn : {
          ...fn,
          occupations: remove
            ? fn.occupations.filter(o => o.id !== occ.id)
            : fn.occupations.some(o => o.id === occ.id)
              ? fn.occupations.map(o => o.id === occ.id ? occ : o)
              : [...fn.occupations, occ],
        }),
      }),
    };
    persist(next);
  };

  const exportJson = () => {
    const token = getToken();
    fetch('/api/admin/career-vault?export=1', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `career-vault-${sphereId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const byType = useMemo(() => sphere ? occupationsByType(sphere) : null, [sphere]);
  const flat = useMemo(() => sphere ? flattenOccupations(sphere) : [], [sphere]);
  const totalOcc = flat.length;

  const pathOf = (ref: OccRef) => `${ref.industry.name} › ${ref.fn.name}`;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>Career Vault</h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            {loading ? 'Loading…' : sphere ? `${sphere.industries.length} industries · ${totalOcc} occupations · classified to personality codes` : 'No data'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {saving && <span style={{ fontSize: 12, color: C.inkMute }}>Saving…</span>}
          <button onClick={() => setAddPlace(true)} disabled={!sphere} style={{
            padding: '9px 16px', borderRadius: 11, border: 'none', background: C.violet, color: 'white',
            fontSize: 13, fontWeight: 700, cursor: sphere ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>+ Occupation</button>
          <button onClick={exportJson} disabled={!sphere} style={{
            padding: '9px 16px', borderRadius: 11, border: `1.5px solid ${C.line}`, background: 'white',
            color: C.inkSoft, fontSize: 13, fontWeight: 700, cursor: sphere ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>↓ Export JSON</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(255,90,90,0.08)', border: `1px solid rgba(255,90,90,0.2)`, color: C.coral, fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Sphere selector */}
        {spheres.length > 1 && (
          <select value={sphereId} onChange={e => setSphereId(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 13, background: 'white', color: C.ink, fontFamily: 'inherit' }}>
            {spheres.map(s => <option key={s.id} value={s.id}>{s.sphere}</option>)}
          </select>
        )}
        {/* View toggle */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['cluster', 'type'] as const).map(v => {
            const active = view === v;
            return (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${active ? C.orangeHot : C.line}`,
                background: active ? 'rgba(255,149,64,0.10)' : 'white',
                color: active ? C.orangeHot : C.inkSoft, fontFamily: 'inherit',
              }}>{v === 'cluster' ? 'By Industry' : 'By Personality Code'}</button>
            );
          })}
        </div>
        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search occupations…"
          style={{ marginLeft: 'auto', padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 13, color: C.ink, background: 'white', width: 240, outline: 'none', fontFamily: 'inherit' }} />
      </div>

      {loading && <div style={{ padding: 60, textAlign: 'center', color: C.inkMute }}>Loading vault…</div>}

      {/* ── BY INDUSTRY ── */}
      {!loading && sphere && view === 'cluster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sphere.industries.map(ind => {
            const fns = ind.functions
              .map(fn => ({ fn, occs: fn.occupations.filter(o => occMatches(o, search)) }))
              .filter(x => x.occs.length > 0);
            if (fns.length === 0) return null;
            return (
              <div key={ind.id} style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', background: C.bone, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{ind.name}</span>
                  <span style={{ fontSize: 11, color: C.inkMute, fontFamily: "'Geist Mono', monospace" }}>{fns.reduce((n, x) => n + x.occs.length, 0)} occupations</span>
                </div>
                {fns.map(({ fn, occs }) => (
                  <div key={fn.id}>
                    <div style={{ padding: '9px 18px', fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", background: '#FCFBFA' }}>{fn.name}</div>
                    {occs.map(occ => (
                      <OccRow key={occ.id} occ={occ} onEdit={() => setEdit({ industryId: ind.id, fnId: fn.id, occ, isNew: false })} />
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── BY PERSONALITY CODE ── */}
      {!loading && sphere && view === 'type' && byType && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8, marginBottom: 20 }}>
            {ALL_TYPES.map(t => {
              const n = byType[t].high.length;
              const active = selType === t;
              return (
                <button key={t} onClick={() => setSelType(active ? null : t)} style={{
                  padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${active ? typeColor(t) : C.line}`,
                  background: active ? typeColor(t) : 'white', color: active ? 'white' : C.ink,
                  fontFamily: "'Geist Mono', monospace", fontWeight: 800, transition: 'all .12s',
                }}>
                  <div style={{ fontSize: 15 }}>{t}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginTop: 2 }}>{n} fit</div>
                </button>
              );
            })}
          </div>

          {selType && (
            <div style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: C.bone, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <TypeBadge t={selType} />
                <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>Best-fit occupations</span>
              </div>
              {byType[selType].high.filter(r => occMatches(r.occupation, search)).map(r => (
                <OccRow key={r.occupation.id} occ={r.occupation} showPath path={pathOf(r)}
                  onEdit={() => setEdit({ industryId: r.industry.id, fnId: r.fn.id, occ: r.occupation, isNew: false })} />
              ))}
              {byType[selType].high.length === 0 && (
                <div style={{ padding: 28, textAlign: 'center', color: C.inkMute, fontSize: 13 }}>No high-fit occupations yet for {selType}.</div>
              )}

              {byType[selType].moderate.length > 0 && (
                <>
                  <div style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: C.orangeHot, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", background: '#FCFBFA' }}>Moderate fit</div>
                  {byType[selType].moderate.filter(r => occMatches(r.occupation, search)).map(r => (
                    <OccRow key={r.occupation.id + '-m'} occ={r.occupation} showPath path={pathOf(r)}
                      onEdit={() => setEdit({ industryId: r.industry.id, fnId: r.fn.id, occ: r.occupation, isNew: false })} />
                  ))}
                </>
              )}
            </div>
          )}
          {!selType && (
            <div style={{ padding: 40, textAlign: 'center', color: C.inkMute, fontSize: 14 }}>Select a personality code above to see its matching occupations.</div>
          )}
        </div>
      )}

      {/* Placement picker for adding a new occupation */}
      {addPlace && sphere && (
        <AddPlacement sphere={sphere} onCancel={() => setAddPlace(false)}
          onPick={(industryId, fnId) => {
            setAddPlace(false);
            setEdit({ industryId, fnId, isNew: true, occ: { id: '', name: '', personality: { mbti_fit: { high: [], moderate: [] } }, specializations: [] } });
          }} />
      )}

      {/* Editor */}
      {edit && (
        <Editor
          target={edit}
          onCancel={() => setEdit(null)}
          onSave={occ => { applyOcc(edit.industryId, edit.fnId, occ); setEdit(null); }}
          onDelete={() => { applyOcc(edit.industryId, edit.fnId, edit.occ, true); setEdit(null); }}
        />
      )}
    </div>
  );
}

// ─── Add-occupation placement picker ─────────────────────────────────────────────

function AddPlacement({ sphere, onCancel, onPick }: {
  sphere: Sphere; onCancel: () => void; onPick: (industryId: string, fnId: string) => void;
}) {
  const [industryId, setIndustryId] = useState(sphere.industries[0]?.id ?? '');
  const industry = sphere.industries.find(i => i.id === industryId);
  const [fnId, setFnId] = useState(industry?.functions[0]?.id ?? '');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(14,18,48,0.35)' }} />
      <div style={{ position: 'relative', width: 'min(440px, 92%)', background: 'white', borderRadius: 18, padding: 26, boxShadow: '0 20px 60px rgba(14,18,48,0.25)' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>Add occupation</div>
        <div style={{ fontSize: 13, color: C.inkMute, marginBottom: 18 }}>Pick where it belongs in the vault.</div>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Industry</label>
        <select value={industryId} onChange={e => { setIndustryId(e.target.value); const ind = sphere.industries.find(i => i.id === e.target.value); setFnId(ind?.functions[0]?.id ?? ''); }}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 14, background: C.bone, color: C.ink, fontFamily: 'inherit', marginBottom: 14 }}>
          {sphere.industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Function</label>
        <select value={fnId} onChange={e => setFnId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 14, background: C.bone, color: C.ink, fontFamily: 'inherit' }}>
          {industry?.functions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={() => fnId && onPick(industryId, fnId)} disabled={!fnId} style={{
            padding: '11px 20px', borderRadius: 11, border: 'none', background: fnId ? C.violet : C.line, color: 'white',
            fontSize: 13, fontWeight: 800, cursor: fnId ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>Continue</button>
          <button onClick={onCancel} style={{
            padding: '11px 18px', borderRadius: 11, border: `1.5px solid ${C.line}`, background: 'white',
            color: C.inkSoft, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
