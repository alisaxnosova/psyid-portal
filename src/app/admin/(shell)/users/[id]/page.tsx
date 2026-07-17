'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { admin, AdminUser, AdminAttempt, isAdminLoggedIn } from '@/lib/adminApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    COMPLETED: { label: 'Completed', bg: '#f0fdf4', color: '#16a34a' },
    IN_PROGRESS: { label: 'In Progress', bg: '#fefce8', color: '#ca8a04' },
    CREATED: { label: 'Created', bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ padding: '3px 8px', borderRadius: 100, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<(AdminUser & { attempts: AdminAttempt[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    admin.user(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <span style={{ color: '#6b7280' }}>Loading...</span>
    </div>
  );

  if (error || !data) return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px solid #e8eaed' }}>
      <div style={{ fontSize: 15, color: '#dc2626' }}>{error || 'User not found'}</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/users" style={{ fontSize: 13, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
          ← All users
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
          {data.fullName ?? data.firstName ?? data.email}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{data.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed', alignSelf: 'start' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Information</div>
          {[
            { label: 'ID', value: data.id },
            { label: 'Email', value: data.email },
            { label: 'Name', value: data.fullName ?? data.firstName ?? '—' },
            { label: 'Registered', value: formatDate(data.createdAt) },
            { label: 'Tests', value: `${data.attemptsCount} (${data.completedCount} completed)` },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                {row.label}
              </div>
              <div style={{ fontSize: 13, color: '#374151', wordBreak: 'break-all' }}>{row.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8eaed', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8eaed' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Test history</div>
          </div>

          {data.attempts.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              No tests found
            </div>
          ) : data.attempts.map((attempt, i) => (
            <div key={attempt.id} style={{
              padding: '14px 20px', borderBottom: i < data.attempts.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <StatusBadge status={attempt.status} />
                  {attempt.topProfile && (
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{attempt.topProfile}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {formatDate(attempt.createdAt)}
                  {attempt.completedAt && ` → ${formatDate(attempt.completedAt)}`}
                </div>
              </div>
              {attempt.status === 'COMPLETED' && (
                <Link href={`/admin/results/${attempt.id}`} style={{
                  fontSize: 12, fontWeight: 600, color: '#6366f1',
                  padding: '6px 12px', borderRadius: 8, border: '1px solid #e0e7ff',
                  background: '#eef2ff',
                }}>
                  Result →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
