'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminApi';
import { AXES, toCode, type AxisCode, type Lang } from '@/data/reno-axes';
import { answerKey, type AnswerKeyCell } from '@/app/reno/data/answer-key';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA', orange: '#FF7A3D', orangeHot: '#FF9540', blue: '#2244E0',
};

const LANGS: Lang[] = ['en', 'ru'];

function cellFor(axis: AxisCode, pos: number): AnswerKeyCell | undefined {
  const cells = answerKey[axis] ?? [];
  return cells.find(c => c.posMin != null && c.posMax != null && pos >= c.posMin && pos <= c.posMax)
    ?? cells.find(c => c.band === 0);
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [pos, setPos] = useState<Record<AxisCode, number>>({ EO: 50, IF: 50, DB: 50, SP: 50, ER: 50 });
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => { if (!isAdminLoggedIn()) router.push('/admin/login'); }, [router]);

  const signature = AXES.map(a => toCode(a, pos[a.code])).join(' · ');
  const tx = (b: { en: string; ru: string }) => (lang === 'ru' ? b.ru || b.en : b.en);

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>Cognitive profiles</h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            ReNo v1.1 · drag each axis to read the interpretive key
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {LANGS.map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '1.5px solid', borderColor: lang === l ? C.blue : C.line,
              background: lang === l ? 'rgba(34,68,224,0.08)' : 'white', color: lang === l ? C.blue : C.inkMute,
              fontFamily: "'Geist Mono', monospace",
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Signature */}
      <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.line}`, padding: '16px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: C.inkMute, textTransform: 'uppercase' }}>Signature</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 800, fontSize: 22, letterSpacing: '0.04em', color: C.ink }}>{signature}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left: sliders */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${C.line}`, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 30 }}>
          {AXES.map(a => {
            const val = pos[a.code];
            const code = toCode(a, val);
            return (
              <div key={a.code}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 800, fontSize: 13, color: a.color }}>{a.code}</span>
                    <span style={{ fontSize: 12, color: C.inkMute }}>{tx(a.name)}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Geist Mono', monospace", padding: '3px 10px', borderRadius: 6, background: `${a.color}18`, color: a.color }}>{code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.inkMute, fontFamily: "'Geist Mono', monospace", marginBottom: 6 }}>
                  <span>{a.minus.letter} {tx(a.minus.label)}</span>
                  <span>{a.plus.letter} {tx(a.plus.label)}</span>
                </div>
                <input type="range" min={0} max={100} step={1} value={val}
                  onChange={e => setPos(prev => ({ ...prev, [a.code]: Number(e.target.value) }))}
                  style={{ width: '100%', appearance: 'none', height: 6, borderRadius: 3, outline: 'none', cursor: 'pointer',
                    background: `linear-gradient(to right, ${a.color} 0%, ${a.color} ${val}%, ${C.line} ${val}%, ${C.line} 100%)` }}
                />
                <div style={{ marginTop: 8, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>
                  {cellFor(a.code, val) ? tx({ en: cellFor(a.code, val)!.en, ru: cellFor(a.code, val)!.ru }) : '—'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: interpretive summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AXES.map(a => {
            const cell = cellFor(a.code, pos[a.code]);
            const framing = cell ? tx(cell.framing) : '';
            return (
              <div key={a.code} style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.line}`, borderLeft: `4px solid ${a.color}`, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 800, fontSize: 13, padding: '2px 9px', borderRadius: 6, background: `${a.color}18`, color: a.color }}>{toCode(a, pos[a.code])}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{tx(a.name)}</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>{cell ? tx({ en: cell.en, ru: cell.ru }) : '—'}</div>
                {framing && <div style={{ fontSize: 11.5, color: C.inkMute, lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>{framing}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
