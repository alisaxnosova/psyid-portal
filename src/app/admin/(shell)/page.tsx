'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orangeHot: '#FF9540' };

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useAdminLang();

  useEffect(() => {
    if (!isAdminLoggedIn()) router.push('/admin/login');
  }, [router]);

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>{t('dash_title')}</h1>
        <p style={{ fontSize: 14, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>{t('dash_sub')}</p>
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: '48px 32px', border: `1px solid ${C.line}`, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: C.inkMute, textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Geist Mono', monospace" }}>
          Coming soon
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Analytics will appear here</div>
        <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6 }}>
          Once results are connected, you'll see users, tests taken, and completion rates.
        </div>
      </div>
    </>
  );
}
