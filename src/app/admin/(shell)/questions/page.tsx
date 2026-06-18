'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminApi';
import { translate, LangCode, LANG_LABELS } from '@/lib/questionTranslations';
import { useAdminLang } from '@/lib/adminLang';

const API = process.env.NEXT_PUBLIC_API_URL ?? '/backend';
const LANGS: LangCode[] = ['ru', 'en', 'es', 'fr', 'ar'];

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A', blue: '#2244E0', blueSoft: '#6A85F0', gold: '#FFC074' };

interface Option {
  id: string; code: string; text: string; order: number;
  keyScores: { score: number; key: { code: string } }[];
}
interface Question {
  id: string; code: string; text: string; order: number; options: Option[];
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

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    fetch(`${API}/methodologies/testpersonal`)
      .then(r => r.json())
      .then(d => setQuestions(d.versions[0].questions))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const isRtl = lang === 'ar';
  const filtered = questions.filter(q => {
    if (!search) return true;
    const tx = translate(q.text, lang).toLowerCase();
    return tx.includes(search.toLowerCase()) || q.code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>{t('ass_title')}</h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            {loading ? '...' : `${questions.length} ${t('ass_sub')}`}
          </p>
        </div>
        <input
          placeholder={t('ass_search')}
          value={search}
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
      {error   && <div style={{ padding: 48, textAlign: 'center', color: C.coral }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(q => {
            const isOpen = expanded === q.id;
            const qText  = translate(q.text, lang);
            return (
              <div key={q.id} style={{
                background: 'white', borderRadius: 16,
                border: `1.5px solid ${isOpen ? C.orangeHot : C.line}`,
                overflow: 'hidden', transition: 'border-color .15s',
              }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                    background: isOpen ? 'rgba(255,149,64,0.12)' : C.bone,
                    color: isOpen ? C.orangeHot : C.inkMute,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, fontFamily: "'Geist Mono', monospace",
                  }}>
                    {q.order}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, color: C.ink, fontWeight: 500, direction: isRtl ? 'rtl' : 'ltr' }}>
                    {qText}
                  </span>
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.inkMute, marginRight: 8, fontFamily: "'Geist Mono', monospace" }}>
                    {q.code}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: C.inkMute }}>
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.bone}`, padding: '4px 0 8px' }}>
                    {q.options.map(opt => {
                      const key   = opt.keyScores?.[0]?.key?.code;
                      const score = opt.keyScores?.[0]?.score;
                      return (
                        <div key={opt.id} style={{
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
                          }}>
                            {opt.code}
                          </span>
                          <span style={{ flex: 1, fontSize: 13, color: C.inkSoft }}>
                            {translate(opt.text, lang)}
                          </span>
                          {key && (
                            <span style={{
                              flexShrink: 0, fontSize: 11, fontWeight: 700,
                              padding: '2px 9px', borderRadius: 6,
                              background: 'rgba(255,149,64,0.12)', color: C.orangeHot,
                              fontFamily: "'Geist Mono', monospace",
                            }}>
                              {key} +{score}
                            </span>
                          )}
                        </div>
                      );
                    })}
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
