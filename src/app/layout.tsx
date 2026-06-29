import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/shared/Nav';

export const metadata: Metadata = {
  title: 'PsyID — Your Personality Passport',
  description: 'Discover your personality type, strengths, and the careers where you\'ll naturally excel. Free 15-minute assessment.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
