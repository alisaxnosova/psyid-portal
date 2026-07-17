'use client';

import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orangeHot: '#FF9540', coral: '#FF5A5A' };

const FEATURES = [
  {
    icon: '📄',
    en: { title: 'Basic Report Template', desc: 'Starter tier PDF — overview of PsyID type, key traits, and brief recommendations.' },
  },
  {
    icon: '📈',
    en: { title: 'Growth Report Template', desc: 'Mid-tier PDF — deeper trait analysis, growth areas, and coaching prompts.' },
  },
  {
    icon: '⭐',
    en: { title: 'Premium Report Template', desc: 'Full 20+ page PDF — complete psychological passport with team fit and career mapping.' },
  },
  {
    icon: '⬆️',
    en: { title: 'Upload PDFs', desc: 'Upload base template files for each tier. Sections auto-filled from test results.' },
  },
  {
    icon: '✏️',
    en: { title: 'Edit Sections', desc: 'Customize text blocks, reorder sections, and adjust layout per tier.' },
  },
  {
    icon: '🔄',
    en: { title: 'Regenerate Reports', desc: 'Re-trigger PDF generation for any completed user — push an updated template to existing orders.' },
  },
];

export default function ReportTemplatesPage() {
  const { t, lang } = useAdminLang();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
            {t('nav_report_tmpls')}
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
          {'PDF report generation for each tier — Basic, Growth, and Premium. Upload templates, edit sections, and regenerate reports for any order.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {FEATURES.map((f) => {
          const content = f.en;
          return (
            <div key={f.en.title} style={{
              background: 'white', borderRadius: 18, padding: '22px 22px',
              border: `1.5px solid ${C.line}`, opacity: 0.6,
            }}>
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
