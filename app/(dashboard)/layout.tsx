/**
 * Dashboard layout for authenticated users.
 * Handles user session check, navigation, and logout.
 *
 * Why: Centralizing session checks here prevents unauthorized access to dashboard pages.
 * The header and navigation ensure users always have access to poll management.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to login.
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Loading user session...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Already redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        {/* Navigation... */}
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
