'use client';

const C_BLUE = '#2244E0';
const C_ORANGE = '#FF9540';

export function Logo({ light }: { light?: boolean }) {
  const boxBg = light ? '#fff' : '#0E1230';
  const textColor = light ? '#fff' : '#0E1230';
  const accentColor = light ? C_ORANGE : C_ORANGE;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: 30, height: 30, borderRadius: 9,
        background: boxBg,
        position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'inline-block',
      }}>
        <span style={{ position: 'absolute', left: 5, top: 5, width: 9, height: 9, borderRadius: '50%', background: C_BLUE }}/>
        <span style={{ position: 'absolute', right: 5, bottom: 5, width: 9, height: 9, borderRadius: 3, background: accentColor }}/>
      </span>
      <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: textColor }}>
        Psy<span style={{ color: accentColor }}>ID</span>
      </span>
    </div>
  );
}
