import type { Metadata } from 'next';
import './globals.css';
import { SiteLangProvider } from '@/lib/siteLang';

export const metadata: Metadata = {
  title: 'PsyID — Your personal universe',
  description: 'Five axes of character rendered as a living personal universe. Everything that glows is measured. Nothing is invented.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteLangProvider>
          <main>{children}</main>
        </SiteLangProvider>
      </body>
    </html>
  );
}
