'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/auth-context';

/**
 * Provides a layout for authentication pages (Login, Register).
 *
 * This layout ensures a consistent look and feel for all auth-related routes.
 * It also handles redirecting authenticated users away from these pages.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element | null} The rendered layout or null if the user is authenticated.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // WHY: We prevent authenticated users from seeing the login/register pages.
    // If the user is already logged in, they should be in the main app.
    if (!loading && user) {
      router.push('/polls');
    }
  }, [user, loading, router]);

  // While checking user status, show a loading indicator.
  // This prevents a flash of the auth page before redirection.
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // If the user is authenticated, we return null because the redirect is in progress.
  // The useEffect hook will handle the navigation.
  if (user) {
    return null; // Should already be redirected by useEffect
  }

  // If the user is not authenticated, render the auth page within this layout.
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="py-4 px-6 border-b bg-white">
        <div className="container mx-auto flex justify-center">
          <h1 className="text-2xl font-bold text-slate-800">ALX Polly</h1>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="py-4 px-6 border-t bg-white">
        <div className="container mx-auto text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
