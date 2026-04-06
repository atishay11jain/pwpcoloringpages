import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from './components/AdminSidebar';

export const metadata = {
  title: 'Admin Panel - Coloring Pages',
  description: 'Manage your coloring pages',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: We can't access the current pathname in a layout, so we need to handle
  // auth in the pages themselves or use middleware. For now, we'll just render
  // the children and let individual pages handle auth redirects.

  const session = await auth();

  // If no session, just render children (login page will handle this)
  if (!session?.user) {
    return <>{children}</>;
  }

  // If authenticated, show the admin layout with sidebar
  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
