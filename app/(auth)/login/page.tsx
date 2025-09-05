'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/app/lib/actions/auth-actions';

/**
 * Renders the user login page.
 *
 * This component provides a form for users to enter their email and password.
 * It handles form submission, calls the server-side `login` action, and provides
 * user feedback on success or failure.
 *
 * @returns {JSX.Element} The rendered login page component.
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission for the login attempt.
   *
   * It constructs a FormData object, calls the `login` server action, and manages
   * loading and error states. On successful login, it redirects the user to the
   * main polls page.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // The `login` action is a server action, so this call is a secure RPC
    // to the backend.
    try {
      const result = await login({ 
        email: formData.get('email') as string,
        password: formData.get('password') as string
      });

      // If the server action returns an error, display a generic message.
      // WHY: We avoid displaying the raw error to prevent leaking backend details.
      if (result?.error) {
        setError('Login failed. Please check your credentials and try again.');
        setLoading(false);
      } else {
        // On success, perform a full page reload to the /polls route.
        // WHY: A full reload ensures the entire app state, including user session,
        // is correctly initialized.
        window.location.href = '/polls';
      }
    } catch (e) {
      // Catch any unexpected network or server errors.
      setError('An unexpected error occurred. Please try again.');
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

