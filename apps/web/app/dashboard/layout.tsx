import { Sidebar } from '@/components/sidebar';
import { SiteProvider } from '@/components/site-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-[var(--bg-primary)]">
          {children}
        </main>
      </div>
    </SiteProvider>
  );
}
