'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ReportViewer() {
  const params = useSearchParams();
  const sessionId = params.get('session');
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!sessionId) { setStatus('not-found'); return; }
    fetch(`/api/career-report/${sessionId}`)
      .then(r => {
        if (!r.ok) { setStatus('not-found'); return; }
        setStatus('ready');
      })
      .catch(() => setStatus('not-found'));
  }, [sessionId]);

  if (!sessionId || status === 'not-found') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1C1C28', color: 'rgba(255,255,255,0.5)', fontSize: 15,
        fontFamily: 'system-ui, sans-serif',
      }}>
        Report not found. It may still be generating — check back shortly.
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1C1C28', color: 'rgba(255,255,255,0.5)', fontSize: 15,
        fontFamily: 'system-ui, sans-serif',
      }}>
        Loading your report…
      </div>
    );
  }

  // Serve the report as a full-page iframe
  return (
    <iframe
      ref={iframeRef}
      src={`/api/career-report/${sessionId}`}
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="Your Career Compass"
    />
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1C1C28', color: 'rgba(255,255,255,0.5)', fontSize: 15,
      }}>
        Loading…
      </div>
    }>
      <ReportViewer />
    </Suspense>
  );
}
