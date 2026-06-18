import AdminShellLayout from './admin-layout';
import { AdminLangProvider } from '@/lib/adminLang';

export default function AdminShellRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLangProvider>
      <AdminShellLayout>{children}</AdminShellLayout>
    </AdminLangProvider>
  );
}
