'use client';

import { AXES } from '@/data/reno';

type Props = {
  axes: Record<string, { value: number }>;
  size?: number;
  showLabels?: boolean;
};

export function ProfileGlyph({ axes, size = 280, showLabels }: Props) {
  const keys = Object.keys(axes);
  const R = size / 2 - 30;
  const cx = size / 2;
  const cy = size / 2;

  const points = keys.map((k, i) => {
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    const val = axes[k].value;
    const r = (Math.abs(val) / 100) * R * 0.85 + R * 0.15;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      key: k,
      angle,
    };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + 'Z';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="glyphGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FF6EA5" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#E6337C" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4B1E8E" stopOpacity="0.7" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {[0.33, 0.66, 1].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * f} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}
      {keys.map((_, i) => {
        const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={(cx + Math.cos(angle) * R).toFixed(2)}
            y2={(cy + Math.sin(angle) * R).toFixed(2)}
            stroke="rgba(255,255,255,0.1)"
          />
        );
      })}

      <path d={pathD} fill="url(#glyphGrad)" opacity="0.6" filter="url(#glow)" />
      <path d={pathD} fill="url(#glyphGrad)" opacity="0.85" stroke="white" strokeWidth="1.5" />

      {points.map((p, i) => {
        const axis = AXES.find(a => a.id === p.key);
        return (
          <g key={i}>
            <circle cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r="5" fill="white" />
            <circle cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r="3" fill={axis?.color || '#E6337C'} />
            {showLabels && axis && (
              <text
                x={(cx + Math.cos(p.angle) * (R + 20)).toFixed(2)}
                y={(cy + Math.sin(p.angle) * (R + 20)).toFixed(2)}
                fill="white"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                dominantBaseline="middle"
                opacity="0.85"
              >{axis.short}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
