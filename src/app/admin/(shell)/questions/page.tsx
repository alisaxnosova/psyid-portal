'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn, getAdminToken } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';

type LangCode = 'ru' | 'en' | 'es' | 'fr' | 'ar';
const LANGS: LangCode[] = ['ru', 'en', 'es', 'fr', 'ar'];
const LANG_LABELS: Record<LangCode, string> = { ru: 'RU', en: 'EN', es: 'ES', fr: 'FR', ar: 'AR' };

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540',
  coral: '#FF5A5A', blue: '#2244E0',
  green: '#22AA60',
};

const AXIS_COLORS: Record<string, string> = {
  EI: '#2244E0', SN: '#22AA60', TF: '#B25AD0', JP: '#FF7A3D',
};

interface LangText { ru?: string; en?: string; es?: string; fr?: string; ar?: string; [k: string]: string | undefined }
interface Option { id: string; text: LangText; key: string; score: number }
interface Question {
  id: string; axis: string; type: string;
  text: LangText; options: Option[];
}

function authHeader() {
  return { Authorization: `Bearer ${getAdminToken()}` };
}

export default function QuestionsPage() {
  const router = useRouter();
  const { t } = useAdminLang();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [lang, setLang]           = useState<LangCode>('ru');
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [editing, setEditing]     = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Question | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    fetch('/api/admin/questions', { headers: authHeader() })
      .then(r => r.json())
      .then(d => setQuestions((d as { questions: Question[] }).questions))
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [router]);

  const isRtl = lang === 'ar';

  const filtered = questions.filter(q => {
    if (!search) return true;
    const tx = q.text[lang] ?? q.text.ru ?? '';
    return tx.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase());
  });

  const startEdit = (q: Question) => {
    setEditing(q.id);
    setEditDraft(JSON.parse(JSON.stringify(q)) as Question);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditDraft(null);
  };

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
      setEditing(null);
      setEditDraft(null);
      setSaved(editDraft.id);
      setTimeout(() => setSaved(null), 2000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [editDraft]);

  const updateDraftText = (field: 'text', langKey: LangCode, value: string) => {
    if (!editDraft) return;
    setEditDraft(prev => prev ? { ...prev, [field]: { ...prev[field], [langKey]: value } } : null);
  };

  const updateDraftOption = (optId: string, field: 'text', langKey: LangCode, value: string) => {
    if (!editDraft) return;
    setEditDraft(prev => prev ? {
      ...prev,
      options: prev.options.map(o =>
        o.id === optId ? { ...o, [field]: { ...o[field], [langKey]: value } } : o
      ),
    } : null);
  };

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>{t('ass_title')}</h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            {loading ? '...' : `${questions.length} ${t('ass_sub')}`}
          </p>
        </div>
        <input
          placeholder={t('ass_search')} value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.line}`,
            fontSize: 14, color: C.ink, background: 'white', width: 240, outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Language switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {LANGS.map(l => {
          const active = lang === l;
          return (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: active ? C.orangeHot : C.line,
              background: active ? 'rgba(255,149,64,0.10)' : 'white',
              color: active ? C.orangeHot : C.inkSoft,
              fontFamily: "'Geist Mono', monospace", transition: 'all .15s',
            }}>
              {LANG_LABELS[l]}
            </button>
          );
        })}
      </div>

      {loading && <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('loading')}</div>}
      {error   && <div style={{ padding: 24, color: C.coral, fontSize: 13 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((q, qIdx) => {
            const isOpen = expanded === q.id;
            const isEditMode = editing === q.id;
            const draft = isEditMode ? editDraft : null;
            const displayQ = draft ?? q;
            const qText = displayQ.text[lang] ?? displayQ.text.ru ?? '';
            const axisColor = AXIS_COLORS[q.axis] ?? C.inkMute;

            return (
              <div key={q.id} style={{
                background: 'white', borderRadius: 16,
                border: `1.5px solid ${isOpen ? C.orangeHot : C.line}`,
                overflow: 'hidden', transition: 'border-color .15s',
              }}>
                {/* Row header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px' }}>
                  <span style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                    background: isOpen ? 'rgba(255,149,64,0.12)' : C.bone,
                    color: isOpen ? C.orangeHot : C.inkMute,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, fontFamily: "'Geist Mono', monospace",
                  }}>
                    {qIdx + 1}
                  </span>

                  <button
                    onClick={() => setExpanded(isOpen ? null : q.id)}
                    style={{
                      flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: isRtl ? 'right' : 'left', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 14, color: C.ink, fontWeight: 500, direction: isRtl ? 'rtl' : 'ltr' }}>
                      {qText}
                    </span>
                    <span style={{
                      flexShrink: 0, fontSize: 10, fontWeight: 700, fontFamily: "'Geist Mono', monospace",
                      padding: '2px 7px', borderRadius: 5,
                      background: `${axisColor}18`, color: axisColor,
                    }}>
                      {q.axis}
                    </span>
                    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.inkMute, fontFamily: "'Geist Mono', monospace" }}>
                      {q.id}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: C.inkMute }}>
                      <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Edit / Save / Cancel */}
                  {saved === q.id ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: "'Geist Mono', monospace" }}>
                      ✓ {t('ass_saved')}
                    </span>
                  ) : isEditMode ? (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={cancelEdit} style={{
                        padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.line}`,
                        background: 'white', color: C.inkSoft, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>{t('ass_cancel')}</button>
                      <button onClick={saveEdit} disabled={saving} style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: saving ? C.inkMute : C.orangeHot, color: 'white',
                        fontSize: 12, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                      }}>{saving ? '...' : t('ass_save')}</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setExpanded(q.id); startEdit(q); }}
                      style={{
                        flexShrink: 0, padding: '6px 12px', borderRadius: 8,
                        border: `1px solid ${C.line}`, background: 'white',
                        color: C.inkSoft, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                      }}
                    >
                      {t('ass_edit')}
                    </button>
                  )}
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.bone}` }}>
                    {/* Question text editing */}
                    {isEditMode && (
                      <div style={{ padding: '16px 18px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, fontFamily: "'Geist Mono', monospace", marginBottom: 4 }}>
                          QUESTION TEXT
                        </div>
                        {LANGS.map(l => (
                          <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ width: 28, fontSize: 10, fontWeight: 800, color: C.inkMute, fontFamily: "'Geist Mono', monospace', paddingTop: 10" }}>
                              {l.toUpperCase()}
                            </span>
                            <textarea
                              value={draft?.text[l] ?? ''}
                              onChange={e => updateDraftText('text', l, e.target.value)}
                              dir={l === 'ar' ? 'rtl' : 'ltr'}
                              rows={2}
                              style={{
                                flex: 1, padding: '8px 12px', borderRadius: 8,
                                border: `1.5px solid ${l === lang ? C.orangeHot : C.line}`,
                                fontSize: 13, color: C.ink, fontFamily: 'inherit',
                                resize: 'vertical', outline: 'none',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Options */}
                    <div style={{ padding: isEditMode ? '12px 18px 16px' : '4px 0 8px' }}>
                      {isEditMode && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, fontFamily: "'Geist Mono', monospace", marginBottom: 12 }}>
                          OPTIONS
                        </div>
                      )}
                      {displayQ.options.map(opt => {
                        const optText = opt.text[lang] ?? opt.text.ru ?? '';
                        const keyColor = opt.key === 'E' || opt.key === 'S' || opt.key === 'T' || opt.key === 'J'
                          ? axisColor : C.inkMute;

                        return (
                          <div key={opt.id}>
                            {isEditMode ? (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                  <span style={{
                                    width: 24, height: 24, borderRadius: 6, background: C.bone,
                                    color: C.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                    fontFamily: "'Geist Mono', monospace", flexShrink: 0,
                                  }}>{opt.id}</span>
                                  <span style={{
                                    fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                                    background: `${keyColor}18`, color: keyColor,
                                    fontFamily: "'Geist Mono', monospace",
                                  }}>{opt.key} +{opt.score}</span>
                                </div>
                                {LANGS.map(l => (
                                  <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ width: 28, fontSize: 10, fontWeight: 800, color: C.inkMute, fontFamily: "'Geist Mono', monospace" }}>
                                      {l.toUpperCase()}
                                    </span>
                                    <input
                                      value={draft?.options.find(o => o.id === opt.id)?.text[l] ?? ''}
                                      onChange={e => updateDraftOption(opt.id, 'text', l, e.target.value)}
                                      dir={l === 'ar' ? 'rtl' : 'ltr'}
                                      style={{
                                        flex: 1, padding: '7px 12px', borderRadius: 8,
                                        border: `1.5px solid ${l === lang ? C.orangeHot : C.line}`,
                                        fontSize: 13, color: C.ink, fontFamily: 'inherit',
                                        outline: 'none',
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 18px 10px 64px',
                                borderBottom: `1px solid ${C.bone}`,
                                direction: isRtl ? 'rtl' : 'ltr',
                              }}>
                                <span style={{
                                  flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                                  background: C.bone, color: C.inkSoft,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                  fontFamily: "'Geist Mono', monospace",
                                }}>{opt.id}</span>
                                <span style={{ flex: 1, fontSize: 13, color: C.inkSoft }}>{optText}</span>
                                <span style={{
                                  flexShrink: 0, fontSize: 11, fontWeight: 700,
                                  padding: '2px 9px', borderRadius: 6,
                                  background: `${keyColor}18`, color: keyColor,
                                  fontFamily: "'Geist Mono', monospace",
                                }}>
                                  {opt.key} +{opt.score}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
