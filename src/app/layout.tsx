import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/shared/Nav';

export const metadata: Metadata = {
  title: 'PsyID — Психологический паспорт ребёнка',
  description: 'Узнайте психотип, сильные стороны и подходящие профессии вашего ребёнка. Бесплатный тест за 15 минут.',
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
