import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export function AppShell() {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <Header />
        <main className="pt-16 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
