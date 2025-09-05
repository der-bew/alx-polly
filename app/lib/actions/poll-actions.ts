/**
 * Server actions for poll CRUD operations.
 *
 * These functions ensure that only the poll owner can modify their polls
 * and that voting logic is handled securely (e.g., with user/session checks).
 */

export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Validation: Ensure a question and at least two options.
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user session; only authenticated users can create polls.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  // Insert poll. Each poll is tied to the creating user's ID.
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates a poll's question or options.
 * Only the poll's owner can perform this operation.
 *
 * Why: Enforcing ownership check prevents IDOR vulnerabilities.
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Validate minimum poll requirements
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Confirm the user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Only allow poll owner to update
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id); // Ownership check

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
