'use client';

import { useState } from 'react';
import { useAdminLang } from '@/lib/adminLang';
import { profiles } from '@/app/reno/data/profiles';
import type { Lang } from '@/app/reno/data/profiles';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540',
};

const LANGS: Lang[] = ['ru', 'en', 'es', 'fr', 'ar'];
const LANG_LABELS: Record<Lang, string> = { ru: 'RU', en: 'EN', es: 'ES', fr: 'FR', ar: 'AR' };

const AXIS_LABELS = {
  EI: 'Extraversion / Introversion',
  SN: 'Sensing / Intuition',
  TF: 'Thinking / Feeling',
  JP: 'Judging / Perceiving',
};

const POLE_COLOR: Record<string, string> = {
  E: '#2244E0', I: '#6A85F0',
  S: '#22AA60', N: '#6ADC9A',
  T: '#B25AD0', F: '#E090FF',
  J: '#FF7A3D', P: '#FFC074',
  balanced: '#8A8FA8',
};

export default function AnswerKeyPage() {
  const { t } = useAdminLang();
  const [axisIdx, setAxisIdx] = useState(0);
  const [lang, setLang] = useState<Lang>('ru');

  const axis = profiles[axisIdx];
  const isRtl = lang === 'ar';

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
          {t('ak_title')}
        </h1>
        <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
          {t('ak_sub')}
        </p>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {/* Axis tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {profiles.map((ax, i) => {
            const active = i === axisIdx;
            return (
              <button key={ax.axis} onClick={() => setAxisIdx(i)} style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: active ? C.orangeHot : C.line,
                background: active ? 'rgba(255,149,64,0.10)' : 'white',
                color: active ? C.orangeHot : C.inkSoft,
                fontFamily: "'Geist Mono', monospace", transition: 'all .15s',
              }}>
                {ax.axis}
              </button>
            );
          })}
        </div>

        {/* Language tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {LANGS.map(l => {
            const active = l === lang;
            return (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: active ? '#2244E0' : C.line,
                background: active ? 'rgba(34,68,224,0.08)' : 'white',
                color: active ? '#2244E0' : C.inkMute,
                fontFamily: "'Geist Mono', monospace", transition: 'all .15s',
              }}>
                {LANG_LABELS[l]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Axis title */}
      <div style={{
        fontSize: 14, fontWeight: 600, color: C.inkSoft,
        marginBottom: 16, padding: '10px 14px',
        background: 'white', borderRadius: 10, border: `1px solid ${C.line}`,
        display: 'inline-block',
      }}>
        {AXIS_LABELS[axis.axis]}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 16, border: `1.5px solid ${C.line}`, background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }} dir={isRtl ? 'rtl' : 'ltr'}>
          <thead>
            <tr style={{ background: C.bone }}>
              <th style={{
                padding: '10px 14px', textAlign: isRtl ? 'right' : 'left',
                fontWeight: 700, color: C.ink, fontSize: 11,
                borderBottom: `1.5px solid ${C.line}`,
                fontFamily: "'Geist Mono', monospace",
                position: 'sticky', left: 0, background: C.bone, zIndex: 1,
                minWidth: 140,
              }}>
                Level
              </th>
              {(axis.dimLabels[lang] ?? axis.dimLabels.ru).map((label, i) => (
                <th key={i} style={{
                  padding: '10px 12px', textAlign: isRtl ? 'right' : 'left',
                  fontWeight: 600, color: C.inkSoft, fontSize: 11,
                  borderBottom: `1.5px solid ${C.line}`,
                  minWidth: 180,
                }}>
                  {label || `Dim ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {axis.levels.map((level, rowIdx) => {
              const poleColor = POLE_COLOR[level.pole] ?? C.inkMute;
              const dims = level.dims[lang]?.length
                ? level.dims[lang]
                : level.dims.ru;
              return (
                <tr key={rowIdx} style={{
                  borderBottom: `1px solid ${C.bone}`,
                  background: rowIdx % 2 === 0 ? 'white' : 'rgba(246,241,234,0.4)',
                }}>
                  <td style={{
                    padding: '12px 14px',
                    position: 'sticky', left: 0, zIndex: 1,
                    background: rowIdx % 2 === 0 ? 'white' : 'rgba(246,241,234,0.8)',
                    borderRight: `1px solid ${C.line}`,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, fontFamily: "'Geist Mono', monospace",
                        padding: '2px 7px', borderRadius: 5, display: 'inline-block', width: 'fit-content',
                        background: `${poleColor}22`, color: poleColor,
                      }}>
                        {level.pole === 'balanced' ? '≈' : level.pole}
                        {level.pole !== 'balanced' && ` ${level.min}–${level.max}`}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>
                        {level.label[lang] || level.label.ru}
                      </span>
                    </div>
                  </td>
                  {dims.map((dim, colIdx) => (
                    <td key={colIdx} style={{
                      padding: '12px 12px',
                      color: C.inkSoft, lineHeight: 1.55,
                      verticalAlign: 'top',
                    }}>
                      {dim || <span style={{ color: C.line, fontStyle: 'italic' }}>—</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
