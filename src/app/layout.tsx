import type { Metadata } from 'next';
import './globals.css';
import { SiteLangProvider } from '@/lib/siteLang';

export const metadata: Metadata = {
  title: 'PsyID — Твоя личная вселенная · Your personal universe',
  description: 'Пять осей характера, собранные в живую личную вселенную. Всё, что светится, — измерено. Ничего не выдумано. · Five axes of character rendered as a living personal universe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <SiteLangProvider>
          <main>{children}</main>
        </SiteLangProvider>
      </body>
    </html>
  );
}
