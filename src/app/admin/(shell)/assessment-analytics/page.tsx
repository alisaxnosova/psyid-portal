'use client';

import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orangeHot: '#FF9540', blue: '#2244E0', coral: '#FF5A5A', gold: '#FFC074' };

const MOCK_DROPS = [
  { q: 'Q42', pct: 18, en: 'Maybe it\'s confusing or emotionally heavy.' },
  { q: 'Q31', pct: 14, en: 'Users stall on this — review wording.'   },
  { q: 'Q57', pct: 11, en: 'Possible translation issue in this question.'              },
];

const MOCK_TYPES = [
  { type: 'INTJ', pct: 22, color: C.blue      },
  { type: 'ENFP', pct: 17, color: C.orangeHot },
  { type: 'INFP', pct: 15, color: C.coral     },
  { type: 'ENTP', pct: 12, color: C.gold      },
  { type: 'Other', pct: 34, color: C.inkMute  },
];

const FEATURES = [
  {
    icon: '⚠️',
    en: { title: 'Abandonment Heatmap', desc: 'See exactly which questions cause users to quit — ranked by dropout rate.' },
  },
  {
    icon: '🧠',
    en: { title: 'Type Distribution', desc: 'Which PsyID types are most common? Breakdowns by gender, age, and language.' },
  },
  {
    icon: '💡',
    en: { title: 'Content Insights', desc: 'Use type distribution data to drive content strategy — blog, social, product.' },
  },
  {
    icon: '🔤',
    en: { title: 'Language Breakdown', desc: 'Compare completion rates and type distributions across EN, RU, ES, FR, AR.' },
  },
  {
    icon: '📊',
    en: { title: 'Response Patterns', desc: 'Aggregate answer distributions per question — spot answer bias or clustering.' },
  },
  {
    icon: '🗓️',
    en: { title: 'Cohort Analysis', desc: 'Compare type distributions across registration cohorts — are newer users different?' },
  },
];

export default function AssessmentAnalyticsPage() {
  const { t, lang } = useAdminLang();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
            {t('nav_assess_ana')}
          </h1>
          <span style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800,
            background: 'rgba(255,149,64,0.15)', color: C.orangeHot,
            fontFamily: "'Geist Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {t('coming_soon')}
          </span>
        </div>
        <p style={{ fontSize: 14, color: C.inkMute, marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
          {'Understand which questions cause abandonment, how types are distributed, and generate content ideas from psychographic data.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Abandonment preview */}
        <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: `1.5px solid ${C.line}`, opacity: 0.55 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 18 }}>
            {'Top Abandonment Points'}
          </div>
          {MOCK_DROPS.map(d => (
            <div key={d.q} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 700, color: C.ink }}>{d.q}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.coral, fontFamily: "'Geist Mono', monospace" }}>{d.pct}% {'quit here'}</span>
              </div>
              <div style={{ fontSize: 12, color: C.inkMute, marginBottom: 6 }}>{d.en}</div>
              <div style={{ height: 5, background: C.bone, borderRadius: 100 }}>
                <div style={{ height: '100%', width: `${d.pct * 4}%`, background: C.coral, borderRadius: 100 }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Type distribution preview */}
        <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: `1.5px solid ${C.line}`, opacity: 0.55 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 18 }}>
            {'Type Distribution'}
          </div>
          {MOCK_TYPES.map(tp => (
            <div key={tp.type} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 700, color: C.ink }}>{tp.type}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{tp.pct}%</span>
              </div>
              <div style={{ height: 5, background: C.bone, borderRadius: 100 }}>
                <div style={{ height: '100%', width: `${tp.pct * 2.5}%`, background: tp.color, borderRadius: 100 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {FEATURES.map((f) => {
          const content = f.en;
          return (
            <div key={f.en.title} style={{ background: 'white', borderRadius: 18, padding: '22px 22px', border: `1.5px solid ${C.line}`, opacity: 0.6 }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{content.title}</div>
              <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{content.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
