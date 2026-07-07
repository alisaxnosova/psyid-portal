'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn, getAdminToken } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';
import { AXES, AXIS_BY_CODE, AXIS_COLORS, type AxisCode } from '@/data/reno-axes';

type LangCode = 'en' | 'ru';
const LANGS: LangCode[] = ['en', 'ru'];

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540',
  coral: '#FF5A5A', blue: '#2244E0', green: '#22AA60',
};

interface Question {
  id: string;
  axis: AxisCode;
  pole: string;
  reverse: boolean;
  text: { en: string; ru: string };
}

function authHeader() {
  return { Authorization: `Bearer ${getAdminToken()}` };
}

export default function QuestionsPage() {
  const router = useRouter();
  const { t } = useAdminLang();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [source, setSource]       = useState<string>('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [lang, setLang]           = useState<LangCode>('en');
  const [search, setSearch]       = useState('');
  const [axisFilter, setAxisFilter] = useState<AxisCode | 'all'>('all');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [editing, setEditing]     = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Question | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/questions', { headers: authHeader() })
      .then(r => r.json())
      .then(d => { setQuestions((d as { questions: Question[] }).questions); setSource((d as { source?: string }).source ?? ''); })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    load();
  }, [router, load]);

  const reset = async () => {
    if (!confirm('Reset the question bank to the bundled ReNo v1.1 default? This clears admin edits.')) return;
    await fetch('/api/admin/questions', { method: 'DELETE', headers: authHeader() });
    load();
  };

  const filtered = questions.filter(q => {
    if (axisFilter !== 'all' && q.axis !== axisFilter) return false;
    if (!search) return true;
    const tx = q.text[lang] ?? q.text.en ?? '';
    return tx.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase());
  });

  const startEdit = (q: Question) => { setEditing(q.id); setEditDraft(JSON.parse(JSON.stringify(q)) as Question); };
  const cancelEdit = () => { setEditing(null); setEditDraft(null); };

  const saveEdit = useCallback(async () => {
    if (!editDraft) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions/${editDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(editDraft),
      });
      if (!res.ok) throw new Error('Save failed');
      setQuestions(prev => prev.map(q => q.id === editDraft.id ? editDraft : q));
      setEditing(null); setEditDraft(null);
      setSaved(editDraft.id); setTimeout(() => setSaved(null), 2000);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }, [editDraft]);

  const patch = (p: Partial<Question>) => setEditDraft(prev => prev ? { ...prev, ...p } : null);

  const counts = AXES.map(a => ({ a, n: questions.filter(q => q.axis === a.code).length }));

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>Question bank</h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            {loading ? '…' : `ReNo v1.1 · ${questions.length} items · ${source === 'redis' ? 'edited' : 'bundled default'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink, background: 'white', width: 220, outline: 'none', fontFamily: 'inherit' }}
          />
          <button onClick={reset} style={{ padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.line}`, background: 'white', color: C.inkSoft, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Reset to default
          </button>
        </div>
      </div>

      {/* Axis filter + language */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setAxisFilter('all')} style={chip(axisFilter === 'all', C.ink)}>All · {questions.length}</button>
        {counts.map(({ a, n }) => (
          <button key={a.code} onClick={() => setAxisFilter(a.code)} style={chip(axisFilter === a.code, a.color)}>
            {a.code} · {n}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {LANGS.map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            border: '1.5px solid', borderColor: lang === l ? C.orangeHot : C.line,
            background: lang === l ? 'rgba(255,149,64,0.10)' : 'white',
            color: lang === l ? C.orangeHot : C.inkSoft, fontFamily: "'Geist Mono', monospace",
          }}>{l.toUpperCase()}</button>
        ))}
      </div>

      {loading && <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('loading')}</div>}
      {error && <div style={{ padding: 24, color: C.coral, fontSize: 13 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((q, qIdx) => {
            const isOpen = expanded === q.id;
            const isEditMode = editing === q.id;
            const draft = isEditMode ? editDraft : null;
            const displayQ = draft ?? q;
            const qText = displayQ.text[lang] ?? displayQ.text.en ?? '';
            const axis = AXIS_BY_CODE[q.axis];
            const axisColor = AXIS_COLORS[q.axis] ?? C.inkMute;
            const poleLabel = axis ? (q.pole === axis.plus.letter ? axis.plus : axis.minus) : null;

            return (
              <div key={q.id} style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${isOpen ? C.orangeHot : C.line}`, overflow: 'hidden', transition: 'border-color .15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px' }}>
                  <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: isOpen ? 'rgba(255,149,64,0.12)' : C.bone, color: isOpen ? C.orangeHot : C.inkMute, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>{qIdx + 1}</span>

                  <button onClick={() => setExpanded(isOpen ? null : q.id)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 1, fontSize: 14, color: C.ink, fontWeight: 500 }}>{qText}</span>
                    <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, fontFamily: "'Geist Mono', monospace", padding: '2px 7px', borderRadius: 5, background: `${axisColor}18`, color: axisColor }}>
                      {q.axis} · {q.pole}{q.reverse ? ' ⟲' : ''}
                    </span>
                    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.inkMute, fontFamily: "'Geist Mono', monospace" }}>{q.id}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: C.inkMute }}><path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>

                  {saved === q.id ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: "'Geist Mono', monospace" }}>✓ saved</span>
                  ) : isEditMode ? (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={cancelEdit} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: 'white', color: C.inkSoft, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                      <button onClick={saveEdit} disabled={saving} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: saving ? C.inkMute : C.orangeHot, color: 'white', fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{saving ? '…' : 'Save'}</button>
                    </div>
                  ) : (
                    <button onClick={() => { setExpanded(q.id); startEdit(q); }} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: 'white', color: C.inkSoft, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                  )}
                </div>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.bone}`, padding: '16px 18px' }}>
                    {isEditMode && draft ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {LANGS.map(l => (
                          <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ width: 28, fontSize: 10, fontWeight: 800, color: C.inkMute, fontFamily: "'Geist Mono', monospace", paddingTop: 10 }}>{l.toUpperCase()}</span>
                            <textarea value={draft.text[l] ?? ''} onChange={e => patch({ text: { ...draft.text, [l]: e.target.value } })} rows={2}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${l === lang ? C.orangeHot : C.line}`, fontSize: 13, color: C.ink, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                          <label style={lbl}>Axis
                            <select value={draft.axis} onChange={e => { const ax = e.target.value as AxisCode; patch({ axis: ax, pole: AXIS_BY_CODE[ax].plus.letter }); }} style={sel}>
                              {AXES.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name.en}</option>)}
                            </select>
                          </label>
                          <label style={lbl}>Pole
                            <select value={draft.pole} onChange={e => patch({ pole: e.target.value })} style={sel}>
                              {[AXIS_BY_CODE[draft.axis].plus, AXIS_BY_CODE[draft.axis].minus].map(p => <option key={p.letter} value={p.letter}>{p.letter} — {p.label.en}</option>)}
                            </select>
                          </label>
                          <label style={{ ...lbl, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" checked={draft.reverse} onChange={e => patch({ reverse: e.target.checked })} />
                            Reverse-scored
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 24, fontSize: 13, color: C.inkSoft, flexWrap: 'wrap' }}>
                        <div><b style={{ color: C.ink }}>Axis:</b> {axis?.name.en} ({q.axis})</div>
                        <div><b style={{ color: C.ink }}>Pole:</b> {q.pole} — {poleLabel?.label.en}</div>
                        <div><b style={{ color: C.ink }}>Reverse:</b> {q.reverse ? 'yes' : 'no'}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const chip = (active: boolean, color: string): React.CSSProperties => ({
  padding: '6px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
  border: '1.5px solid', borderColor: active ? color : '#E5DED2',
  background: active ? `${color}15` : 'white', color: active ? color : '#4F5470',
  fontFamily: "'Geist Mono', monospace",
});
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, fontWeight: 700, color: '#8A8FA8', fontFamily: "'Geist Mono', monospace" };
const sel: React.CSSProperties = { padding: '7px 10px', borderRadius: 8, border: '1.5px solid #E5DED2', fontSize: 13, color: '#0E1230', fontFamily: 'inherit', background: 'white', fontWeight: 500 };
