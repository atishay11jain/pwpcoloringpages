/**
 * Login page layout - no sidebar, no auth check
 */

export const metadata = {
  title: 'Sign In - Admin Panel',
  description: 'Sign in to the admin panel',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
