'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/app/lib/actions/auth-actions';

// SECURITY IMPROVEMENTS:
// 1. Prevent Open Redirects: Ensure window.location.href is only set to a safe, expected path (/polls).
// 2. Prevent Error Leaks: Only show generic error messages to users, not internal details.
// 3. Prevent Timing Attacks: Keep error and loading state handling consistent.
// 4. Prevent XSS: React escapes error output by default, but extra care is taken here.
// 5. Rate Limiting & Brute Force Protection: This should be handled server-side in login(), but a note is added.
// 6. Use HTTPS for all navigation/requests (assumed enforced elsewhere, but add a warning).

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Defensive: Don't leak raw error messages to users
    let genericErrorMsg = 'Login failed. Please check your credentials and try again.';

    try {
      const result = await login({ email, password });

      // Defensive: Don't allow redirect to untrusted URLs
      if (result?.error) {
        setError(genericErrorMsg);
        setLoading(false);
      } else {
        // Only allow navigation to a hardcoded safe location
        window.location.href = '/polls';
      }
    } catch (e) {
      // Catch any thrown errors and set generic error
      setError(genericErrorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login to ALX Polly</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="your@email.com" 
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * SECURITY AUDIT NOTES:
 * - Ensure server-side login() implements rate limiting, brute-force protection, and returns only generic errors.
 * - Ensure HTTPS is enforced throughout the app (usually in deployment config).
 * - Never interpolate error messages from the server directly to user output.
 * - Consider adding CSRF protection if this form is used with non-SPA navigation.
 * - Always validate and sanitize input on the server side.
 */
