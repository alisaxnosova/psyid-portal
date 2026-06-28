'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { isAdminLoggedIn } from '@/lib/adminApi';
import AdminShellLayout from '../../admin-layout';

const API = '/backend';
const KEYS = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
const KEY_COLORS: Record<string, string> = {
  E: '#6366f1', I: '#8b5cf6', S: '#f59e0b', N: '#10b981',
  T: '#3b82f6', F: '#ec4899', J: '#f97316', P: '#14b8a6',
};
const LANGUAGES = [
  { code: 'ru', label: 'Русский', field: 'text' },
  { code: 'en', label: 'English', field: 'enText' },
  { code: 'ar', label: 'العربية', field: 'arText' },
];

interface KeyScore { code: string; score: number }
interface OptionDraft {
  id: string;
  code: string;
  text: string;
  translations: Record<string, string>;
  isActive: boolean;
  keyScores: KeyScore[];
}
interface QuestionDraft {
  id: string;
  code: string;
  text: string;
  translations: Record<string, string>;
  order: number;
  isActive: boolean;
  options: OptionDraft[];
}

function parseQuestion(q: Record<string, unknown>): QuestionDraft {
  const meta = (q.metadata as Record<string, unknown>) ?? {};
  return {
    id: q.id as string,
    code: q.code as string,
    text: q.text as string,
    order: q.order as number,
    isActive: q.isActive as boolean,
    translations: {
      en: (meta.enText as string) ?? '',
      ar: (meta.arText as string) ?? '',
    },
    options: ((q.options as Record<string, unknown>[]) ?? []).map(o => {
      const om = (o.metadata as Record<string, unknown>) ?? {};
      return {
        id: o.id as string,
        code: o.code as string,
        text: o.text as string,
        isActive: o.isActive as boolean,
        translations: {
          en: (om.enText as string) ?? '',
          ar: (om.arText as string) ?? '',
        },
        keyScores: ((o.keyScores as Record<string, unknown>[]) ?? []).map(ks => ({
          code: (ks.key as Record<string, unknown>).code as string,
          score: ks.score as number,
        })),
      };
    }),
  };
}

function KeyScoreEditor({ scores, onChange }: {
  scores: KeyScore[];
  onChange: (scores: KeyScore[]) => void;
}) {
  function setScore(code: string, score: number) {
    const existing = scores.find(s => s.code === code);
    if (score === 0) {
      onChange(scores.filter(s => s.code !== code));
    } else if (existing) {
      onChange(scores.map(s => s.code === code ? { ...s, score } : s));
    } else {
      onChange([...scores, { code, score }]);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {KEYS.map(k => {
        const existing = scores.find(s => s.code === k);
        const score = existing?.score ?? 0;
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 100,
              background: score > 0 ? KEY_COLORS[k] + '20' : '#f3f4f6',
              color: score > 0 ? KEY_COLORS[k] : '#9ca3af',
              fontSize: 11, fontWeight: 700,
            }}>{k}</span>
            <input
              type="number"
              min={0}
              max={5}
              value={score}
              onChange={e => setScore(k, Number(e.target.value))}
              style={{
                width: 40, padding: '2px 6px', borderRadius: 6,
                border: '1.5px solid #e8eaed', fontSize: 12,
                textAlign: 'center', outline: 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function QuestionEditorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const [question, setQuestion] = useState<QuestionDraft | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [activeLang, setActiveLang] = useState('ru');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return; }
    if (isNew) {
      setQuestion({
        id: '', code: '', text: '', translations: { en: '', ar: '' },
        order: 0, isActive: true,
        options: [
          { id: '', code: 'a', text: '', translations: { en: '', ar: '' }, isActive: true, keyScores: [] },
          { id: '', code: 'b', text: '', translations: { en: '', ar: '' }, isActive: true, keyScores: [] },
        ],
      });
      return;
    }
    fetch(`${API}/methodologies/testpersonal`)
      .then(r => r.json())
      .then(d => {
        const qs: Record<string, unknown>[] = d.versions[0].questions ?? [];
        const found = qs.find((q: Record<string, unknown>) => q.id === id);
        if (found) setQuestion(parseQuestion(found));
      })
      .finally(() => setLoading(false));
  }, [id, isNew, router]);

  function updateOption(idx: number, patch: Partial<OptionDraft>) {
    if (!question) return;
    const opts = [...question.options];
    opts[idx] = { ...opts[idx], ...patch };
    setQuestion({ ...question, options: opts });
  }

  function addOption() {
    if (!question) return;
    const codes = 'abcdefghij'.split('');
    const code = codes[question.options.length] ?? `opt${question.options.length}`;
    setQuestion({
      ...question,
      options: [...question.options, {
        id: '', code, text: '', translations: { en: '', ar: '' }, isActive: true, keyScores: [],
      }],
    });
  }

  function removeOption(idx: number) {
    if (!question || question.options.length <= 2) return;
    const opts = [...question.options];
    opts.splice(idx, 1);
    setQuestion({ ...question, options: opts });
  }

  async function handleSave() {
    setSaving(true);
    // Placeholder — will call admin API once Evgeny adds endpoint
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function getText(q: QuestionDraft | OptionDraft) {
    if (activeLang === 'ru') return q.text;
    return q.translations[activeLang] ?? '';
  }
  function setText(patch: string, field: 'question' | 'option', idx?: number) {
    if (!question) return;
    if (field === 'question') {
      if (activeLang === 'ru') setQuestion({ ...question, text: patch });
      else setQuestion({ ...question, translations: { ...question.translations, [activeLang]: patch } });
    } else if (idx !== undefined) {
      if (activeLang === 'ru') updateOption(idx, { text: patch });
      else updateOption(idx, { translations: { ...question.options[idx].translations, [activeLang]: patch } });
    }
  }

  if (loading) return <AdminShellLayout><div style={{ padding: 40, color: '#6b7280' }}>Загрузка...</div></AdminShellLayout>;
  if (!question) return <AdminShellLayout><div style={{ padding: 40, color: '#dc2626' }}>Вопрос не найден</div></AdminShellLayout>;

  return (
    <AdminShellLayout>
      <div style={{ maxWidth: 860 }}>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link href="/questions" style={{ fontSize: 13, color: '#6b7280', display: 'inline-block', marginBottom: 8 }}>
              ← Все вопросы
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
              {isNew ? 'Новый вопрос' : `Вопрос ${question.code}`}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saved && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✓ Сохранено</span>}
            <button onClick={handleSave} disabled={saving} style={{
              padding: '9px 20px', borderRadius: 10,
              background: '#6366f1', color: 'white',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none',
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* Language tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setActiveLang(l.code)} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: activeLang === l.code ? '#6366f1' : '#e8eaed',
              background: activeLang === l.code ? '#eef2ff' : 'white',
              color: activeLang === l.code ? '#6366f1' : '#374151',
              fontWeight: activeLang === l.code ? 700 : 400,
            }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Question text */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Текст вопроса</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={question.isActive}
                  onChange={e => setQuestion({ ...question, isActive: e.target.checked })} />
                Активен
              </label>
              {!isNew && (
                <span style={{ fontSize: 12, color: '#9ca3af' }}>#{question.order} · {question.code}</span>
              )}
            </div>
          </div>
          <textarea
            value={getText(question)}
            onChange={e => setText(e.target.value, 'question')}
            rows={3}
            placeholder={activeLang === 'ru' ? 'Текст вопроса...' : `Перевод (${activeLang})...`}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e8eaed', fontSize: 14, color: '#111827',
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
          />
          {activeLang !== 'ru' && question.text && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>RU: {question.text}</div>
          )}
        </div>

        {/* Options */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8eaed', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Варианты ответов</div>
            <button onClick={addOption} style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer',
            }}>+ Добавить</button>
          </div>

          {question.options.map((opt, idx) => (
            <div key={idx} style={{
              padding: '16px 20px',
              borderBottom: idx < question.options.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: '#eef2ff', color: '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, marginTop: 6,
                }}>
                  {opt.code.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    value={getText(opt)}
                    onChange={e => setText(e.target.value, 'option', idx)}
                    placeholder={activeLang === 'ru' ? 'Текст варианта...' : `Перевод (${activeLang})...`}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1.5px solid #e8eaed', fontSize: 14, color: '#111827',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {activeLang !== 'ru' && opt.text && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>RU: {opt.text}</div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>КЛЮЧИ И ВЕСА</div>
                    <KeyScoreEditor
                      scores={opt.keyScores}
                      onChange={scores => updateOption(idx, { keyScores: scores })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>
                    <input type="checkbox" checked={opt.isActive}
                      onChange={e => updateOption(idx, { isActive: e.target.checked })} />
                    Вкл
                  </label>
                  {question.options.length > 2 && (
                    <button onClick={() => removeOption(idx)} style={{
                      padding: '3px 6px', borderRadius: 6, fontSize: 11,
                      background: '#fef2f2', color: '#dc2626', border: 'none', cursor: 'pointer',
                    }}>✕</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save notice */}
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fefce8', border: '1px solid #fde68a', fontSize: 13, color: '#92400e' }}>
          Сохранение требует admin API от бэкенда (<code>PUT /admin/questions/:id</code>). Пока изменения только в интерфейсе.
        </div>
      </div>
    </AdminShellLayout>
  );
}
