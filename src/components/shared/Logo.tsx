'use client';

export function Logo({ light }: { light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'var(--grad)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: 14,
        letterSpacing: '-0.03em',
        flexShrink: 0,
      }}>Ps</div>
      <div style={{
        fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em',
        color: light ? 'white' : 'var(--ink)',
      }}>
        Psy<span style={{ color: light ? 'rgba(255,255,255,0.6)' : 'var(--violet)' }}>ID</span>
      </div>
    </div>
  );
}
