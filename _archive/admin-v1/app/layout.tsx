import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PsyID Admin",
  description: "PsyID Admin Panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
