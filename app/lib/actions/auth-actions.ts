'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

/**
 * Logs in a user with the provided credentials.
 *
 * This function authenticates a user against the Supabase backend. It is designed
 * to be called from a server-side environment (e.g., a Next.js Server Action)
 * to securely handle user credentials.
 *
 * @param data - An object containing the user's email and password.
 * @returns A promise that resolves to an object. If login is successful,
 *          the `error` property will be `null`. If it fails, the `error`
 *          property will contain a descriptive message.
 * @throws This function does not throw errors directly but returns them in the
 *         response object to allow for graceful error handling on the client.
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  // Attempt to sign in the user with their email and password.
  // Supabase handles the hashing and comparison securely.
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  // If Supabase returns an error (e.g., invalid credentials),
  // we forward a generic error message.
  // WHY: We avoid sending back specific error details from Supabase to prevent
  // leaking information that could be used to guess user accounts.
  if (error) {
    return { error: 'Invalid login credentials.' };
  }

  // On successful login, return a null error to indicate success.
  return { error: null };
}

/**
 * Registers a new user with the provided credentials and name.
 *
 * This function creates a new user account in the Supabase backend. It is
 * intended for use in a server-side context to ensure secure handling of
 * user registration data.
 *
 * @param data - An object containing the user's name, email, and password.
 * @returns A promise that resolves to an object. If registration is successful,
 *          the `error` property is `null`. If it fails (e.g., email already
 *          in use), the `error` property contains a descriptive message.
 * @throws Does not throw errors directly, returns them in the response object.
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  // Attempt to sign up a new user.
  // The user's full name is stored in the `user_metadata`, which is a secure
  // place for non-sensitive profile information.
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  // If an error occurs (e.g., user already exists, weak password),
  // return a generic error message.
  // WHY: Specific errors can reveal whether an email is registered, which is a
  // potential privacy leak.
  if (error) {
    return { error: 'Failed to register user.' };
  }

  // On successful registration, return a null error.
  return { error: null };
}

/**
 * Logs out the currently authenticated user.
 *
 * This function invalidates the user's current session in Supabase, effectively
 * logging them out. It should be called from a server-side environment.
 *
 * @returns A promise that resolves to an object. If logout is successful,
 *          the `error` property is `null`. If it fails, it contains an error message.
 */
export async function logout() {
  const supabase = await createClient();

  // Invalidate the user's session token.
  const { error } = await supabase.auth.signOut();

  // If an error occurs, forward it.
  if (error) {
    return { error: error.message };
  }

  // On successful logout, return a null error.
  return { error: null };
}

/**
 * Retrieves the currently authenticated user's data from the server-side.
 *
 * This function fetches the user object from Supabase based on the session
 * information available in the server context (e.g., cookies). It's useful for
 * server-side rendering and API routes that need user identity.
 *
 * @returns A promise that resolves to the user object if a user is authenticated,
 *          otherwise `null`.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Retrieves the current user session from the server-side.
 *
 * This function is a server-side utility to get the current session details,
 * including the access token and user information. It's a primary way to
 * check if a user is logged in on the server.
 *
 * @returns A promise that resolves to the session object if a user is authenticated,
 *          otherwise `null`.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

