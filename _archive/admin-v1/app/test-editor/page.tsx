'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminApi';
import AdminShellLayout from '../admin-layout';

const API = '/backend';
const KEYS = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
const KEY_COLORS: Record<string, string> = {
  E: '#6366f1', I: '#8b5cf6', S: '#f59e0b', N: '#10b981',
  T: '#3b82f6', F: '#ec4899', J: '#f97316', P: '#14b8a6',
};

interface Question {
  id: string;
  code: string;
  text: string;
  order: number;
  isActive: boolean;
  options: { keyScores: { key: { code: string } }[] }[];
}

interface TestConfig {
  shuffle: boolean;
  shuffleOptions: boolean;
  randomPool: boolean;
  poolSize: number;
  poolPerKey: number;
  requiredKeys: string[];
}

function getQuestionKeys(q: Question): string[] {
  const keys = new Set<string>();
  q.options.forEach(o => o.keyScores.forEach(ks => keys.add(ks.key.code)));
  return Array.from(keys).sort();
}

export default function TestEditorPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<TestConfig>({
    shuffle: false,
    shuffleOptions: false,
    randomPool: false,
    poolSize: 60,
    poolPerKey: 8,
    requiredKeys: [...KEYS],
  });
  const [preview, setPreview] = useState<Question[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return; }
    fetch(`${API}/methodologies/testpersonal`)
      .then(r => r.json())
      .then(d => {
        const qs: Question[] = d.versions[0].questions ?? [];
        setQuestions(qs);
        setPreview(qs.filter(q => q.isActive));
      })
      .finally(() => setLoading(false));
  }, [router]);

  function generatePreview() {
    let pool = questions.filter(q => q.isActive);

    if (config.randomPool && config.requiredKeys.length > 0) {
      // Pick poolPerKey questions per required key
      const picked = new Set<string>();
      const result: Question[] = [];
      config.requiredKeys.forEach(key => {
        const forKey = pool.filter(q => getQuestionKeys(q).includes(key) && !picked.has(q.id));
        const shuffled = [...forKey].sort(() => Math.random() - 0.5);
        shuffled.slice(0, config.poolPerKey).forEach(q => {
          if (!picked.has(q.id)) { picked.add(q.id); result.push(q); }
        });
      });
      pool = result;
    }

    if (config.poolSize > 0 && pool.length > config.poolSize) {
      pool = pool.slice(0, config.poolSize);
    }

    if (config.shuffle) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }

    setPreview(pool);
  }

  async function handleSave() {
    // Will call admin API once Evgeny adds endpoint
    await new Promise(r => setTimeout(r, 400));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Stats per key
  const activeQuestions = questions.filter(q => q.isActive);
  const keyStats = KEYS.map(k => ({
    key: k,
    count: activeQuestions.filter(q => getQuestionKeys(q).includes(k)).length,
  }));

  return (
    <AdminShellLayout>
      <div style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Настройки теста</h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              {loading ? '...' : `${activeQuestions.length} активных вопросов · ${questions.length} всего в базе`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saved && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✓ Сохранено</span>}
            <button onClick={handleSave} style={{
              padding: '9px 20px', borderRadius: 10, background: '#6366f1',
              color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none',
            }}>
              Сохранить конфиг
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Shuffle settings */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Перемешивание</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Перемешивать вопросы</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Каждый тест — в случайном порядке</div>
                </div>
                <div onClick={() => setConfig(c => ({ ...c, shuffle: !c.shuffle }))} style={{
                  width: 40, height: 22, borderRadius: 100, cursor: 'pointer', transition: 'background .2s',
                  background: config.shuffle ? '#6366f1' : '#e5e7eb', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: config.shuffle ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Перемешивать варианты</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Варианты ответов в случайном порядке</div>
                </div>
                <div onClick={() => setConfig(c => ({ ...c, shuffleOptions: !c.shuffleOptions }))} style={{
                  width: 40, height: 22, borderRadius: 100, cursor: 'pointer', transition: 'background .2s',
                  background: config.shuffleOptions ? '#6366f1' : '#e5e7eb', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: config.shuffleOptions ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </label>
            </div>
          </div>

          {/* Pool settings */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Пул вопросов</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>Случайная выборка</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Каждый раз выбирать подмножество из базы</div>
                </div>
                <div onClick={() => setConfig(c => ({ ...c, randomPool: !c.randomPool }))} style={{
                  width: 40, height: 22, borderRadius: 100, cursor: 'pointer', transition: 'background .2s',
                  background: config.randomPool ? '#6366f1' : '#e5e7eb', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: config.randomPool ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </label>

              {config.randomPool && (
                <>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
                      Вопросов на ключ: <strong style={{ color: '#111827' }}>{config.poolPerKey}</strong>
                    </div>
                    <input type="range" min={4} max={20} value={config.poolPerKey}
                      onChange={e => setConfig(c => ({ ...c, poolPerKey: Number(e.target.value) }))}
                      style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
                      Всего вопросов макс: <strong style={{ color: '#111827' }}>{config.poolSize}</strong>
                    </div>
                    <input type="range" min={20} max={questions.length} value={config.poolSize}
                      onChange={e => setConfig(c => ({ ...c, poolSize: Number(e.target.value) }))}
                      style={{ width: '100%' }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Required keys */}
        {config.randomPool && (
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Обязательные ключи в выборке</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>Для каких осей гарантированно включать вопросы</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {KEYS.map(k => {
                const selected = config.requiredKeys.includes(k);
                const count = keyStats.find(s => s.key === k)?.count ?? 0;
                return (
                  <button key={k} onClick={() => setConfig(c => ({
                    ...c,
                    requiredKeys: selected ? c.requiredKeys.filter(r => r !== k) : [...c.requiredKeys, k],
                  }))} style={{
                    padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                    border: '2px solid',
                    borderColor: selected ? KEY_COLORS[k] : '#e8eaed',
                    background: selected ? KEY_COLORS[k] + '15' : 'white',
                    color: selected ? KEY_COLORS[k] : '#6b7280',
                    fontWeight: selected ? 700 : 400, fontSize: 13,
                  }}>
                    {k} <span style={{ fontSize: 11, opacity: 0.7 }}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Distribution */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Распределение по ключам (активные)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {keyStats.map(({ key, count }) => (
              <div key={key} style={{
                padding: '12px 14px', borderRadius: 10,
                background: KEY_COLORS[key] + '10', border: `1.5px solid ${KEY_COLORS[key]}30`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: KEY_COLORS[key], marginBottom: 4 }}>{key}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>вопросов</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8eaed', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Предпросмотр выборки</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{preview.length} вопросов</div>
            </div>
            <button onClick={generatePreview} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer',
            }}>
              ↻ Сгенерировать
            </button>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {preview.slice(0, 30).map((q, i) => (
              <div key={q.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                borderBottom: i < Math.min(preview.length, 30) - 1 ? '1px solid #f3f4f6' : 'none',
              }}>
                <span style={{ fontSize: 12, color: '#9ca3af', width: 24, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{q.text}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {getQuestionKeys(q).map(k => (
                    <span key={k} style={{
                      padding: '1px 6px', borderRadius: 100, fontSize: 10, fontWeight: 700,
                      background: KEY_COLORS[k] + '20', color: KEY_COLORS[k],
                    }}>{k}</span>
                  ))}
                </div>
              </div>
            ))}
            {preview.length > 30 && (
              <div style={{ padding: '10px 20px', color: '#9ca3af', fontSize: 12 }}>
                + ещё {preview.length - 30} вопросов
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShellLayout>
  );
}
