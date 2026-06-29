'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn, getAdminToken } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';
import { profiles, getLevelFromSlider } from '@/app/reno/data/profiles';
import type { Lang } from '@/app/reno/data/profiles';
import { useEffect } from 'react';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540',
  blue: '#2244E0', blueSoft: '#6A85F0',
  green: '#22AA60', purple: '#B25AD0',
};

const LANGS: Lang[] = ['ru', 'en', 'es', 'fr', 'ar'];
const LANG_LABELS: Record<Lang, string> = { ru: 'RU', en: 'EN', es: 'ES', fr: 'FR', ar: 'AR' };

const AXIS_INFO = [
  { axis: 'EI' as const, left: 'E', right: 'I', leftLabel: 'Extraversion', rightLabel: 'Introversion', color: C.blue },
  { axis: 'SN' as const, left: 'S', right: 'N', leftLabel: 'Sensing', rightLabel: 'Intuition', color: C.green },
  { axis: 'TF' as const, left: 'T', right: 'F', leftLabel: 'Thinking', rightLabel: 'Feeling', color: C.purple },
  { axis: 'JP' as const, left: 'J', right: 'P', leftLabel: 'Judging', rightLabel: 'Perceiving', color: C.orange },
];

type SliderState = { EI: number; SN: number; TF: number; JP: number };

export default function AssessmentsPage() {
  const router = useRouter();
  const { t } = useAdminLang();
  const [sliders, setSliders] = useState<SliderState>({ EI: 0, SN: 0, TF: 0, JP: 0 });
  const [lang, setLang] = useState<Lang>('en');
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) router.push('/admin/login');
  }, [router]);

  const handleSlider = (axis: keyof SliderState, value: number) => {
    setSliders(prev => ({ ...prev, [axis]: value }));
  };

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError('');
    setNarrative('');
    try {
      const res = await fetch('/api/admin/report-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ sliders, lang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { narrative: string };
      setNarrative(data.narrative);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sliders, lang]);

  const isRtl = lang === 'ar';

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
          {t('sliders_title')}
        </h1>
        <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
          {t('sliders_sub')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

        {/* ─── Left: Sliders ─── */}
        <div>
          <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${C.line}`, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {AXIS_INFO.map(({ axis, left, right, leftLabel, rightLabel, color }) => {
              const axisData = profiles.find(p => p.axis === axis)!;
              const level = getLevelFromSlider(axisData, sliders[axis]);
              const val = sliders[axis];
              const pole = val < 0 ? left : val > 0 ? right : '≈';
              const strength = Math.abs(val);
              const levelLabel = level.label['en'] || level.label.ru;

              return (
                <div key={axis}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 800, fontSize: 13, color }}>
                        {axis}
                      </span>
                      <span style={{ fontSize: 12, color: C.inkMute }}>
                        {leftLabel} / {rightLabel}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, fontFamily: "'Geist Mono', monospace",
                      padding: '3px 9px', borderRadius: 6,
                      background: `${color}18`, color,
                    }}>
                      {pole === '≈' ? 'Balanced' : `${pole} ${strength}%`}
                    </span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.inkMute, fontFamily: "'Geist Mono', monospace", marginBottom: 6 }}>
                      <span>{left}</span>
                      <span>0</span>
                      <span>{right}</span>
                    </div>
                    <input
                      type="range"
                      min={-100} max={100} value={val} step={1}
                      onChange={e => handleSlider(axis, Number(e.target.value))}
                      style={{
                        width: '100%', appearance: 'none', height: 6,
                        borderRadius: 3, outline: 'none', cursor: 'pointer',
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${(val + 100) / 2}%, ${C.line} ${(val + 100) / 2}%, ${C.line} 100%)`,
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 8, fontSize: 12, color: C.inkSoft, fontStyle: 'italic' }}>
                    {levelLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Language + Generate */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.inkMute, marginBottom: 8 }}>
                {t('sliders_lang')}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {LANGS.map(l => {
                  const active = l === lang;
                  return (
                    <button key={l} onClick={() => setLang(l)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
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
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 14,
                background: loading ? C.inkMute : C.orangeHot, color: 'white',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
                transition: 'background .15s',
              }}
            >
              {loading ? 'Generating...' : narrative ? t('sliders_regen') : t('sliders_gen')}
            </button>
          </div>
        </div>

        {/* ─── Right: Profile preview + Narrative ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick profile summary */}
          <div style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${C.line}`, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMute, marginBottom: 14, fontFamily: "'Geist Mono', monospace", letterSpacing: '0.08em' }}>
              PROFILE SUMMARY
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AXIS_INFO.map(({ axis, left, right, color }) => {
                const axisData = profiles.find(p => p.axis === axis)!;
                const level = getLevelFromSlider(axisData, sliders[axis]);
                const val = sliders[axis];
                const dominantPole = val < 0 ? left : val > 0 ? right : '≈';
                const levelLabel = level.label['en'] || level.label.ru;
                return (
                  <div key={axis} style={{
                    flex: '1 1 calc(50% - 4px)', padding: '10px 14px',
                    borderRadius: 12, background: `${color}10`,
                    border: `1px solid ${color}30`,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color, fontFamily: "'Geist Mono', monospace" }}>
                      {axis}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color, marginTop: 2, fontFamily: "'Geist Mono', monospace" }}>
                      {dominantPole}
                    </div>
                    <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 4, lineHeight: 1.4 }}>
                      {levelLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Narrative */}
          {(narrative || loading || error) && (
            <div style={{
              background: 'white', borderRadius: 16, border: `1.5px solid ${C.line}`,
              padding: '20px 24px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMute, marginBottom: 14, fontFamily: "'Geist Mono', monospace", letterSpacing: '0.08em' }}>
                {t('sliders_preview')}
              </div>

              {loading && (
                <div style={{ color: C.inkMute, fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                  Writing your report...
                </div>
              )}

              {error && (
                <div style={{ color: '#FF5A5A', fontSize: 13 }}>{error}</div>
              )}

              {narrative && (
                <div style={{
                  fontSize: 14, lineHeight: 1.7, color: C.ink,
                  direction: isRtl ? 'rtl' : 'ltr',
                  whiteSpace: 'pre-line',
                }}>
                  {narrative}
                </div>
              )}
            </div>
          )}

          {!narrative && !loading && (
            <div style={{
              borderRadius: 16, border: `2px dashed ${C.line}`,
              padding: '40px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: C.inkMute }}>
                Adjust the sliders and click <strong>Generate Report Preview</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
