'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdminLoggedIn } from '@/lib/adminApi';
import AdminShellLayout from '../admin-layout';

const API = '/backend';
const KEYS = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
const KEY_COLORS: Record<string, string> = {
  E: '#6366f1', I: '#8b5cf6', S: '#f59e0b', N: '#10b981',
  T: '#3b82f6', F: '#ec4899', J: '#f97316', P: '#14b8a6',
};

interface Option {
  id: string;
  code: string;
  text: string;
  order: number;
  isActive: boolean;
  keyScores: { key: { code: string }; score: number }[];
}

interface Question {
  id: string;
  code: string;
  text: string;
  order: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  options: Option[];
}

function getQuestionKeys(q: Question): string[] {
  const keys = new Set<string>();
  q.options.forEach(o => o.keyScores.forEach(ks => keys.add(ks.key.code)));
  return Array.from(keys).sort();
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return; }
    fetch(`${API}/methodologies/testpersonal`)
      .then(r => r.json())
      .then(d => setQuestions(d.versions[0].questions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = questions.filter(q => {
    if (search && !q.text.toLowerCase().includes(search.toLowerCase()) && !q.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterKey && !getQuestionKeys(q).includes(filterKey)) return false;
    if (filterActive === 'active' && !q.isActive) return false;
    if (filterActive === 'inactive' && q.isActive) return false;
    return true;
  });

  const activeCount = questions.filter(q => q.isActive).length;

  return (
    <AdminShellLayout>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Вопросы</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {loading ? '...' : `${questions.length} всего · ${activeCount} активных`}
          </p>
        </div>
        <Link href="/questions/new" style={{
          padding: '9px 18px', borderRadius: 10,
          background: '#6366f1', color: 'white',
          fontSize: 13, fontWeight: 600,
        }}>
          + Новый вопрос
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Поиск по тексту или коду..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e8eaed',
            fontSize: 13, color: '#111827', background: 'white', width: 260, outline: 'none',
          }}
        />
        <select value={filterKey} onChange={e => setFilterKey(e.target.value)} style={{
          padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e8eaed',
          fontSize: 13, color: '#374151', background: 'white', outline: 'none',
        }}>
          <option value="">Все ключи</option>
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilterActive(f)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: filterActive === f ? '#6366f1' : '#e8eaed',
              background: filterActive === f ? '#eef2ff' : 'white',
              color: filterActive === f ? '#6366f1' : '#374151',
              fontWeight: filterActive === f ? 600 : 400,
            }}>
              {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Скрытые'}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: '#9ca3af', alignSelf: 'center' }}>
          {filtered.length} из {questions.length}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8eaed', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 160px 80px 60px',
          padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e8eaed',
          fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <div>#</div>
          <div>Вопрос</div>
          <div>Ключи</div>
          <div>Статус</div>
          <div></div>
        </div>

        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Ничего не найдено</div>
        )}

        {!loading && filtered.map((q, i) => {
          const keys = getQuestionKeys(q);
          return (
            <div key={q.id} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 160px 80px 60px',
              padding: '12px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{q.order}</div>
              <div>
                <div style={{ fontSize: 14, color: '#111827', lineHeight: 1.4 }}>{q.text}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  {q.code} · {q.options.length} вариантов
                  {typeof q.metadata?.enText === 'string' && q.metadata.enText !== q.text && (
                    <span style={{ marginLeft: 6, color: '#c4b5fd' }}>EN</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {keys.map(k => (
                  <span key={k} style={{
                    padding: '2px 7px', borderRadius: 100,
                    background: KEY_COLORS[k] + '20', color: KEY_COLORS[k],
                    fontSize: 11, fontWeight: 700,
                  }}>{k}</span>
                ))}
              </div>
              <div>
                <span style={{
                  padding: '3px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  background: q.isActive ? '#f0fdf4' : '#f3f4f6',
                  color: q.isActive ? '#16a34a' : '#9ca3af',
                }}>
                  {q.isActive ? 'Активен' : 'Скрыт'}
                </span>
              </div>
              <div>
                <Link href={`/questions/${q.id}`} style={{
                  fontSize: 12, color: '#6366f1', fontWeight: 600,
                  padding: '5px 10px', borderRadius: 6, background: '#eef2ff',
                }}>
                  Ред.
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShellLayout>
  );
}
