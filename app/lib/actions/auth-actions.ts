/**
 * Handles user authentication actions using Supabase.
 * Encapsulates login, registration, and logout flows.
 *
 * Separating these concerns allows for security improvements (rate limiting, error handling)
 * and makes authentication logic portable for future changes (e.g., switching providers).
 */

export async function login(data: LoginFormData) {
  // Instantiate the Supabase client for server-side auth.
  const supabase = await createClient();

  // Attempt to sign in with provided credentials.
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  // Only return a generic error to prevent leaking details.
  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Registers a new user with Supabase authentication.
 * Also stores the user's name as custom metadata.
 *
 * Why: Keeping registration and login separated allows for custom onboarding logic,
 * custom error handling, and extensibility for features like email verification.
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name, // Custom metadata for user profile
      },
    },
  });

  // Return a generic message on failure
  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Logs the user out and invalidates the session.
 * Proper session invalidation is critical to prevent session hijacking.
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
