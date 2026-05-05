'use client';

export function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '5px 11px', borderRadius: 100,
      background: color || 'var(--bg-2)',
      color: color ? 'white' : 'var(--ink-2)',
      fontSize: 12, fontWeight: 600,
    }}>{children}</span>
  );
}
