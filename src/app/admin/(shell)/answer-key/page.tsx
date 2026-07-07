'use client';

import { useState } from 'react';
import { answerKey } from '@/app/reno/data/answer-key';
import { AXES, AXIS_BY_CODE, type AxisCode, type Lang } from '@/data/reno-axes';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA', orange: '#FF7A3D', orangeHot: '#FF9540', blue: '#2244E0',
};

const LANGS: Lang[] = ['en', 'ru'];

export default function AnswerKeyPage() {
  const [axisCode, setAxisCode] = useState<AxisCode>('EO');
  const [lang, setLang] = useState<Lang>('en');

  const axis = AXIS_BY_CODE[axisCode];
  const cells = answerKey[axisCode] ?? [];

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>Answer key</h1>
        <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
          ReNo Interpretive Key v1.2 · five axes · EN/RU · position 0–100 → band 0–5
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {AXES.map(a => {
            const active = a.code === axisCode;
            return (
              <button key={a.code} onClick={() => setAxisCode(a.code)} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: '1.5px solid', borderColor: active ? a.color : C.line,
                background: active ? `${a.color}14` : 'white', color: active ? a.color : C.inkSoft,
                fontFamily: "'Geist Mono', monospace",
              }}>{a.code}</button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {LANGS.map(l => {
            const active = l === lang;
            return (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: '1.5px solid', borderColor: active ? C.blue : C.line,
                background: active ? 'rgba(34,68,224,0.08)' : 'white', color: active ? C.blue : C.inkMute,
                fontFamily: "'Geist Mono', monospace",
              }}>{l.toUpperCase()}</button>
            );
          })}
        </div>
      </div>

      {/* Axis header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: '14px 18px', background: 'white', borderRadius: 12, border: `1px solid ${C.line}`, borderLeft: `4px solid ${axis.color}` }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
            {lang === 'ru' ? axis.name.ru : axis.name.en}
          </div>
          <div style={{ fontSize: 12, color: C.inkMute, fontFamily: "'Geist Mono', monospace", marginTop: 3 }}>
            {axis.plus.letter} {lang === 'ru' ? axis.plus.label.ru : axis.plus.label.en} (100) ·
            {' '}{axis.minus.letter} {lang === 'ru' ? axis.minus.label.ru : axis.minus.label.en} (0)
          </div>
        </div>
      </div>

      {/* Cells table */}
      <div style={{ overflowX: 'auto', borderRadius: 16, border: `1.5px solid ${C.line}`, background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bone }}>
              {['Code', 'Level', 'Position', lang === 'ru' ? 'Описание' : 'Descriptor', lang === 'ru' ? 'Примечание' : 'Framing'].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: C.ink, fontSize: 11, borderBottom: `1.5px solid ${C.line}`, fontFamily: "'Geist Mono', monospace", minWidth: i >= 3 ? 280 : 80 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((cell, i) => {
              const balanced = cell.band === 0;
              const poleColor = balanced ? C.inkMute : axis.color;
              return (
                <tr key={cell.code + i} style={{ borderBottom: `1px solid ${C.bone}`, background: i % 2 ? 'rgba(246,241,234,0.4)' : 'white' }}>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Geist Mono', monospace", padding: '3px 9px', borderRadius: 6, background: `${poleColor}1c`, color: poleColor }}>{cell.code}</span>
                  </td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top', color: C.inkSoft, fontSize: 12 }}>
                    <b style={{ color: C.ink }}>{cell.band}</b>
                  </td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top', color: C.inkMute, fontFamily: "'Geist Mono', monospace", fontSize: 11 }}>
                    {cell.posMin}–{cell.posMax}
                  </td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top', color: C.inkSoft, lineHeight: 1.55 }}>
                    {lang === 'ru' ? cell.ru || cell.en : cell.en}
                  </td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top', color: C.inkMute, lineHeight: 1.5, fontSize: 12, fontStyle: 'italic' }}>
                    {(lang === 'ru' ? cell.framing.ru : cell.framing.en) || <span style={{ color: C.line }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
