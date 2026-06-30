'use client';

import Link from 'next/link';
import { Product } from '@/data/reno';

export function ProductCard({ product, featured }: { product: Product; featured?: boolean }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div style={{
      background: featured ? 'var(--grad-hero)' : 'white',
      color: featured ? 'white' : 'var(--ink)',
      border: featured ? 'none' : '1px solid var(--line)',
      borderRadius: 22,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform .3s, box-shadow .3s',
      cursor: 'pointer',
      boxShadow: featured
        ? '0 20px 50px -15px rgba(75, 30, 142, 0.5)'
        : '0 10px 30px -15px rgba(0,0,0,0.1)',
    }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = '')}
    >
      {featured && (
        <div style={{
          position: 'absolute', top: '-40%', right: '-30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #FF6EA5 0%, transparent 70%)',
          opacity: 0.4, filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative' }}>
        {product.tag && (
          <div style={{
            display: 'inline-block',
            padding: '4px 12px', borderRadius: 100,
            background: featured ? 'white' : 'var(--magenta)',
            color: featured ? 'var(--violet)' : 'white',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            marginBottom: 16,
          }}>{product.tag.toUpperCase()}</div>
        )}
        <div style={{
          fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
          opacity: featured ? 0.7 : 0.5, marginBottom: 10,
        }}>ТАРИФ {product.id.toUpperCase()}</div>
        <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 14, opacity: featured ? 0.8 : 0.7, marginBottom: 24 }}>
          {product.desc}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
          <span className="serif" style={{ fontSize: 40, letterSpacing: '-0.03em' }}>
            {product.price.toLocaleString('ru')} ₽
          </span>
          {product.priceSuffix && (
            <span style={{ fontSize: 13, opacity: 0.7 }}>{product.priceSuffix}</span>
          )}
          {product.oldPrice && (
            <span style={{ fontSize: 16, textDecoration: 'line-through', opacity: 0.5 }}>
              {product.oldPrice.toLocaleString('ru')} ₽
            </span>
          )}
        </div>
        {discount > 0 && (
          <div style={{
            fontSize: 12,
            color: featured ? '#FFC34A' : 'var(--magenta)',
            fontWeight: 600,
            marginBottom: 20,
          }}>
            -{discount}% до 30 апреля
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {product.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5 }}>
              <span style={{ color: featured ? '#FFC34A' : 'var(--magenta)' }}>✓</span>{f}
            </div>
          ))}
        </div>

        <Link href="/reno" style={{
          display: 'block', width: '100%', padding: '14px', borderRadius: 100,
          background: featured ? 'white' : 'var(--ink)',
          color: featured ? 'var(--violet)' : 'white',
          fontSize: 14, fontWeight: 600,
          textAlign: 'center',
          transition: 'all .2s',
        }}>Выбрать тариф →</Link>
      </div>
    </div>
  );
}
