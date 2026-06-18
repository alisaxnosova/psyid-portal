'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminApi';
import { translate, LangCode, LANG_LABELS } from '@/lib/questionTranslations';

const API = process.env.NEXT_PUBLIC_API_URL ?? '/backend';
const LANGS: LangCode[] = ['ru', 'en', 'es', 'fr', 'ar'];

interface Option {
  id: string;
  code: string;
  text: string;
  order: number;
  keyScores: { score: number; key: { code: string } }[];
}

interface Question {
  id: string;
  code: string;
  text: string;
  order: number;
  options: Option[];
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<LangCode>('ru');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

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
    const t = translate(q.text, lang).toLowerCase();
    return t.includes(search.toLowerCase()) || q.code.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Вопросы теста</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {loading ? '...' : `${questions.length} вопросов · TestPersonal v1`}
          </p>
        </div>
        <input
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e8eaed',
            fontSize: 14, color: '#111827', background: 'white', width: 240, outline: 'none',
          }}
        />
      </div>

      {/* Language switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {LANGS.map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: '1.5px solid',
            borderColor: lang === l ? '#6366f1' : '#e8eaed',
            background: lang === l ? '#6366f1' : 'white',
            color: lang === l ? 'white' : '#374151',
            transition: 'all .15s',
          }}>
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Questions list */}
      {loading && <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>}
      {error && <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(q => {
            const isOpen = expanded === q.id;
            const qText = translate(q.text, lang);
            return (
              <div key={q.id} style={{
                background: 'white', borderRadius: 12,
                border: `1.5px solid ${isOpen ? '#6366f1' : '#e8eaed'}`,
                overflow: 'hidden', transition: 'border-color .15s',
              }}>
                {/* Question row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                    background: isOpen ? '#eef2ff' : '#f3f4f6',
                    color: isOpen ? '#6366f1' : '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {q.order}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 14, color: '#111827', fontWeight: 500,
                    direction: isRtl ? 'rtl' : 'ltr',
                  }}>
                    {qText}
                  </span>
                  <span style={{
                    flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#9ca3af',
                    marginRight: 8,
                  }}>
                    {q.code}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{
                    flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform .2s', color: '#9ca3af',
                  }}>
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Options */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '4px 0 8px' }}>
                    {q.options.map(opt => {
                      const key = opt.keyScores?.[0]?.key?.code;
                      const score = opt.keyScores?.[0]?.score;
                      return (
                        <div key={opt.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 18px 10px 64px',
                          borderBottom: '1px solid #f9fafb',
                          direction: isRtl ? 'rtl' : 'ltr',
                        }}>
                          <span style={{
                            flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                            background: '#f3f4f6', color: '#6b7280',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          }}>
                            {opt.code}
                          </span>
                          <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>
                            {translate(opt.text, lang)}
                          </span>
                          {key && (
                            <span style={{
                              flexShrink: 0, fontSize: 11, fontWeight: 700,
                              padding: '2px 8px', borderRadius: 6,
                              background: '#f0fdf4', color: '#16a34a',
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
