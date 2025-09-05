'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/app/lib/actions/auth-actions';

/**
 * Validates if a password meets the defined strength criteria.
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is strong, false otherwise.
 */
function isStrongPassword(password: string) {
  // Requires min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(password);
}

/**
 * Validates if a string is a properly formatted email address.
 *
 * @param {string} email - The email to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
function isValidEmail(email: string) {
  // Basic regex for email format validation.
  return /^[^
@]+@[^
@]+\.[^
@]+$/.test(email);
}

/**
 * Renders the user registration page.
 *
 * This component provides a form for new users to sign up. It includes client-side
 * validation for email format, password strength, and password confirmation.
 * On submission, it calls the `register` server action.
 *
 * @returns {JSX.Element} The rendered registration page component.
 */
export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission for user registration.
   *
   * It performs client-side validation before calling the `register` server action.
   * Manages loading and error states, providing feedback to the user.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // WHY: Client-side validation provides immediate feedback to the user,
    // improving the user experience and reducing unnecessary server requests.
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
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
        // Display a generic error to avoid leaking backend details.
        setError('Registration failed. An account with this email may already exist.');
        setLoading(false);
      } else {
        // On success, redirect with a full page reload.
        window.location.href = '/polls';
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
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
