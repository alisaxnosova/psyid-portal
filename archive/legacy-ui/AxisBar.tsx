'use client';

import { Axis, intensity } from '@/data/reno';

type Props = {
  axis: Axis;
  value: number;
  compensation?: number;
  compact?: boolean;
};

export function AxisBar({ axis, value, compensation = 0, compact }: Props) {
  const pct = (value + 100) / 2;
  const natural = Math.abs(value);

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: compact ? 12 : 13, marginBottom: 8,
      }}>
        <span style={{ color: value < 0 ? 'var(--ink)' : 'var(--ink-3)', fontWeight: value < 0 ? 600 : 400 }}>
          {axis.left.label}
        </span>
        <span style={{ color: value >= 0 ? 'var(--ink)' : 'var(--ink-3)', fontWeight: value >= 0 ? 600 : 400 }}>
          {axis.right.label}
        </span>
      </div>
      <div style={{
        height: compact ? 8 : 10,
        background: 'var(--bg-3)',
        borderRadius: 100,
        position: 'relative',
        overflow: 'visible',
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: value >= 0 ? '50%' : `${pct}%`,
          right: value >= 0 ? `${100 - pct}%` : '50%',
          background: axis.color,
          borderRadius: 100,
          transition: 'all .8s cubic-bezier(.22,1,.36,1)',
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: -3, bottom: -3,
          width: 1, background: 'var(--ink-3)', opacity: 0.3,
        }} />
        {compensation !== 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${((value + compensation) + 100) / 2}%`,
              top: -6, bottom: -6, width: 2,
              background: 'var(--ink)',
              transform: 'translateX(-50%)',
            }}
            title="Компенсация"
          >
            <div style={{
              position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
              fontSize: 10, color: 'var(--ink)', whiteSpace: 'nowrap',
              background: 'white', padding: '1px 6px', borderRadius: 4,
              border: '1px solid var(--ink)',
            }}>комп.</div>
          </div>
        )}
      </div>
      {!compact && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {value < 0 ? `${natural}` : ''}
          </span>
          <span className="mono" style={{
            fontSize: 11,
            color: natural > 60 ? axis.color : 'var(--ink-3)',
            fontWeight: natural > 60 ? 600 : 400,
          }}>
            {intensity(natural)}
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {value >= 0 ? `${natural}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}
