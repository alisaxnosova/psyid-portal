'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileGlyph } from '@/components/shared/ProfileGlyph';
import { attempts, NextQuestion } from '@/lib/renoApi';

const METHODOLOGY_CODE = 'testpersonal';

function CardsAnswer({ value, onChange, accent }: { value?: string; onChange: (v: string) => void; accent: string }) {
  const opts = [
    { text: 'Совсем нет' },
    { text: 'Когда как' },
    { text: 'Это про меня' },
  ];
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
      {opts.map(o => {
        const active = value === o.text;
        return (
          <button key={o.text} onClick={() => onChange(o.text)} style={{
            padding: '32px 28px', width: 200, borderRadius: 22,
            border: `2px solid ${active ? accent : 'var(--line)'}`,
            background: active ? accent : 'white',
            color: active ? 'white' : 'var(--ink)',
            fontSize: 16, fontWeight: 600,
            transition: 'all .2s',
            transform: active ? 'translateY(-5px)' : 'none',
            boxShadow: active ? `0 12px 24px ${accent}40` : 'none',
          }}>{o.text}</button>
        );
      })}
    </div>
  );
}

function ButtonsAnswer({ value, onChange, accent, options }: {
  value?: string; onChange: (v: string) => void; accent: string;
  options: { id: string; text: string }[];
}) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            padding: '20px 22px', borderRadius: 18, minWidth: 130,
            border: `2px solid ${active ? accent : 'var(--line)'}`,
            background: active ? accent : 'white',
            color: active ? 'white' : 'var(--ink)',
            fontSize: 14, fontWeight: 600,
            transition: 'all .2s',
            transform: active ? 'translateY(-3px)' : 'none',
            boxShadow: active ? `0 8px 20px ${accent}33` : 'none',
          }}>{o.text}</button>
        );
      })}
    </div>
  );
}

function Computing({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const steps = ['Читаю ваши ответы', 'Вычисляю интенсивность по осям', 'Нахожу компенсации', 'Считаю индекс напряжения', 'Собираю отчёт'];
  const demoAxes = {
    attention: { value: 62 }, processing: { value: 78 }, decision: { value: 34 },
    organization: { value: -18 }, source: { value: 55 }, risk: { value: 42 }, tempo: { value: -28 },
  };

  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 650);
    const t = setTimeout(onDone, 3400);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [onDone]);

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)', background: 'var(--grad-hero)', color: 'white',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 80,
    }}>
      <div style={{ marginBottom: 48, animation: 'pulse-glow 2s ease-in-out infinite' }}>
        <ProfileGlyph axes={demoAxes} size={200} />
      </div>
      <div style={{ textAlign: 'center', maxWidth: 640 }}>
        {steps.map((s, i) => (
          <div key={i} className="serif" style={{
            fontSize: 36, letterSpacing: '-0.02em', color: 'white',
            opacity: i <= step ? 1 : 0.25,
            transition: 'all .5s', marginBottom: 14,
          }}>{s}{i === step && '...'}</div>
        ))}
      </div>
    </div>
  );
}

const AXIS_COLORS: Record<string, string> = {
  attention: '#8A2FBF', processing: '#4B1E8E', decision: '#E6337C',
  organization: '#FF6EA5', source: '#2A0E5C', risk: '#FF8E3C', tempo: '#8A2FBF',
};

type AnswerMode = 'cards' | 'buttons';

export default function TestPage() {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [question, setQuestion] = useState<NextQuestion | null>(null);

  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState('');
  const [answerMode] = useState<AnswerMode>('cards');
  const [needAuth, setNeedAuth] = useState(false);

  const loadNextQuestion = useCallback(async (id: string) => {
    try {
      const res = await attempts.nextQuestion(id);
      if (!res.question) {
        setComputing(true);
      } else {
        setQuestion(res);
        setSelectedOptionId(undefined);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки вопроса');
    }
  }, []);

  useEffect(() => {
    const userId     = typeof window !== 'undefined' ? localStorage.getItem('reno_user_id') : null;
    const accessCode = typeof window !== 'undefined' ? sessionStorage.getItem('access_code') : null;
    const anonId     = typeof window !== 'undefined' ? sessionStorage.getItem('anon_session_id') : null;

    // No registered user and no access code → show auth wall
    if (!userId && !accessCode) {
      setNeedAuth(true);
      return;
    }

    // Use registered userId if present, else anonymous session id from /start
    const effectiveId = userId ?? anonId ?? ('guest_' + Date.now());

    attempts.create(METHODOLOGY_CODE, effectiveId)
      .then(a => {
        setAttemptId(a.id);
        return loadNextQuestion(a.id);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка создания теста'));
  }, [loadNextQuestion]);

  const submitAnswer = async () => {
    if (!attemptId || !question?.question || !selectedOptionId) return;
    try {
      const res = await attempts.answer(attemptId, question.question.id, selectedOptionId);
      if (!res.next.question) {
        await attempts.complete(attemptId);
        setComputing(true);
      } else {
        setQuestion(res.next);
        setSelectedOptionId(undefined);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка отправки ответа');
    }
  };

  if (needAuth) {
    // Redirect to /start — access code is required, no registration
    if (typeof window !== 'undefined') window.location.replace('/start');
    return (
      <div style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 16 }}>
          Redirecting…
        </div>
      </div>
    );
    return (
      <div style={{
        minHeight: 'calc(100vh - 120px)', background: 'var(--grad-hero)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48,
      }}>
        <div style={{
          background: 'white', color: 'var(--ink)', borderRadius: 28,
          padding: '52px 48px', textAlign: 'center', maxWidth: 480, width: '100%',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, background: 'var(--grad-cta)',
            margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3C10.13 3 7 6.13 7 10c0 5.25 7 14 7 14s7-8.75 7-14c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 14 7a2.5 2.5 0 0 1 0 5z" fill="white"/>
            </svg>
          </div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Шаг 1 из 2</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
            Создайте аккаунт
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 28 }}>
            Займёт 30 секунд. После регистрации сразу начнёте тест - результаты сохранятся в вашем личном кабинете.
          </p>
          <a href="/register" className="btn-primary" style={{
            display: 'block', textAlign: 'center', padding: '15px 24px',
            fontSize: 15, marginBottom: 14, textDecoration: 'none',
          }}>
            Зарегистрироваться бесплатно →
          </a>
          <a href="/login" style={{ fontSize: 14, color: 'var(--ink-3)' }}>
            Уже есть аккаунт? Войти
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 480 }}>
          <h2 className="serif" style={{ fontSize: 24, marginBottom: 12 }}>Что-то пошло не так</h2>
          <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  if (computing && attemptId) {
    return <Computing onDone={() => router.push(`/results?id=${attemptId}`)} />;
  }

  if (!question?.question) {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="serif" style={{ fontSize: 24, color: 'var(--ink-3)' }}>Загружаем тест...</div>
        </div>
      </div>
    );
  }

  const q = question.question;
  const axisCode = q.code.split('_')[0] ?? 'attention';
  const accent = AXIS_COLORS[axisCode] ?? '#4B1E8E';
  const progress = (question.progress.answered / question.progress.total) * 100;

  const cardOptions = q.options.slice(0, 3).map((o, i) => {
    const labels = ['Совсем нет', 'Когда как', 'Это про меня'];
    return { ...o, text: labels[i] ?? o.text };
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-2)' }}>
      {/* Progress */}
      <div style={{ padding: '24px 48px', background: 'white', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
            <button onClick={() => router.push('/')} style={{ color: 'var(--ink-3)' }}>← Сохранить и выйти</button>
            <span className="mono" style={{ color: 'var(--ink-3)' }}>
              Вопрос {question.progress.answered + 1} из {question.progress.total} ·{' '}
              <span style={{ color: accent, fontWeight: 600 }}>
                {axisCode.charAt(0).toUpperCase() + axisCode.slice(1)}
              </span>
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: accent,
              transition: 'width .6s cubic-bezier(.22,1,.36,1)',
              borderRadius: 100,
            }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 60 }}>
        <div className="fade-in-up" style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: accent, marginBottom: 32 }}>
            {axisCode.charAt(0).toUpperCase() + axisCode.slice(1)}
          </div>
          <h2 className="serif" style={{
            fontSize: 52, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 64,
          }}>
            «{q.text}»
          </h2>

          {answerMode === 'cards' ? (
            <CardsAnswer
              value={selectedOptionId ? cardOptions.find(o => o.id === selectedOptionId)?.text : undefined}
              onChange={text => {
                const opt = cardOptions.find(o => o.text === text);
                if (opt) setSelectedOptionId(opt.id);
              }}
              accent={accent}
            />
          ) : (
            <ButtonsAnswer
              value={selectedOptionId}
              onChange={setSelectedOptionId}
              accent={accent}
              options={q.options}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '32px 48px', background: 'white', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div />
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: question.progress.total }).map((_, i) => (
              <div key={i} style={{
                width: i === question.progress.answered ? 22 : 7, height: 7, borderRadius: 100,
                background: i < question.progress.answered ? 'var(--magenta)' : 'var(--bg-3)',
                transition: 'all .3s',
              }} />
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={submitAnswer}
            disabled={!selectedOptionId}
          >
            {question.progress.answered === question.progress.total - 1 ? 'Посмотреть результат' : 'Далее'} →
          </button>
        </div>
      </div>
    </div>
  );
}
