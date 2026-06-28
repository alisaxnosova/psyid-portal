'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth, saveAdminToken } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Try local auth first (ADMIN_SECRET env var, no backend dependency)
      const localRes = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (localRes.ok) {
        const { accessToken } = await localRes.json() as { accessToken: string };
        saveAdminToken(accessToken);
        router.push('/admin');
        return;
      }
      // Fall back to backend auth
      const { accessToken } = await adminAuth.login(email, password);
      saveAdminToken(accessToken);
      router.push('/admin');
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Geist', 'Onest', system-ui, sans-serif",
      background: `
        radial-gradient(ellipse 65% 55% at 88% 88%, rgba(255,165,72,.7) 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 20% 30%, rgba(58,98,232,.8) 0%, transparent 60%),
        linear-gradient(135deg, #050B36 0%, #0E1F6E 40%, #4B266A 70%, #B23A4C 100%)
      `,
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: 'white', position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'inline-block' }}>
              <span style={{ position: 'absolute', left: 6, top: 6, width: 10, height: 10, borderRadius: '50%', background: '#2244E0' }}/>
              <span style={{ position: 'absolute', right: 6, bottom: 6, width: 10, height: 10, borderRadius: 3, background: '#FF9540' }}/>
            </span>
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', color: '#fff' }}>
              Psy<span style={{ color: '#FF9540' }}>ID</span>
            </span>
          </div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            Admin Panel
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.14)', borderRadius: 24, padding: '36px 32px',
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', color: '#fff', margin: '0 0 28px' }}>
            Войти в аккаунт
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
                Email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, boxSizing: 'border-box',
                  border: '1.5px solid rgba(255,255,255,0.15)', fontSize: 14,
                  color: '#fff', background: 'rgba(255,255,255,0.08)',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
                Пароль
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, boxSizing: 'border-box',
                  border: '1.5px solid rgba(255,255,255,0.15)', fontSize: 14,
                  color: '#fff', background: 'rgba(255,255,255,0.08)',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'rgba(255,90,90,0.15)', border: '1px solid rgba(255,90,90,0.3)', color: '#FF8A8A', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: loading ? 'rgba(255,149,64,0.5)' : 'linear-gradient(95deg, #FF5C72, #FF8A45)',
              color: 'white', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
              fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 8px 24px -8px rgba(255,114,80,.6)',
              transition: 'all .2s',
            }}>
              {loading ? 'Вход...' : 'Войти →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
