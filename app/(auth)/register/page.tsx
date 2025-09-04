'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/app/lib/actions/auth-actions';

/**
 * Security Audit & Fixes:
 * 1. **Password Policy**: Enforce strong password requirements on the client side (min length, complexity).
 * 2. **Email Format Validation**: Add extra validation for email format.
 * 3. **Error Handling**: Avoid leaking detailed backend errors to user, generalize error message.
 * 4. **Prevent Multiple Submits**: Disable form while loading and prevent double submit.
 * 5. **Autofill Attributes**: Recommend using autocomplete attributes for name/email/password.
 * 6. **No Sensitive Data in URL**: Ensure no sensitive data leaks through the URL.
 * 7. **XSS Safe Error Display**: Ensure error messages displayed are safe from XSS (generalized by point 3).
 */

function isStrongPassword(password: string) {
  // Min 8 chars, at least one upper, one lower, one number, one special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(password);
}

function isValidEmail(email: string) {
  // Simple RFC 5322 compliant regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return; // Prevent double submit
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validations
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        'Passwords must be at least 8 characters long and contain upper and lower case letters, a number, and a special character.'
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const result = await register({ name, email, password });

      if (result?.error) {
        // Generalize error to prevent leaking backend details
        setError('Registration failed. Please try again or contact support.');
        setLoading(false);
      } else {
        window.location.href = '/polls'; // Full reload to pick up session
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to start creating and sharing polls</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                type="text" 
                placeholder="John Doe" 
                required
                autoComplete="name"
                minLength={2}
                maxLength={64}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="your@email.com" 
                required
                autoComplete="email"
                minLength={5}
                maxLength={128}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required
                autoComplete="new-password"
                minLength={8}
                maxLength={64}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                required
                autoComplete="new-password"
                minLength={8}
                maxLength={64}
              />
            </div>
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
