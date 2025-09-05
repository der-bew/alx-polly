''''''"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new poll in the database.
 *
 * This server action handles the creation of a poll. It first authenticates the user,
 * then validates the incoming form data to ensure it meets the requirements (a question
 * and at least two options). If validation and authentication pass, it inserts the
 * new poll into the database.
 *
 * @param formData - The FormData object from the poll creation form.
 *                   It should contain a 'question' and multiple 'options' fields.
 * @returns A promise that resolves to an object. If successful, `error` is `null`.
 *          If an error occurs, `error` contains a descriptive message.
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // WHY: Basic server-side validation prevents empty or invalid polls from being created.
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Ensure a user is logged in before allowing poll creation.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be logged in to create a poll." };
  }

  // Insert the new poll into the 'polls' table, associating it with the current user.
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    // Return a generic error to avoid leaking database-specific details.
    return { error: "Failed to create the poll." };
  }

  // WHY: Revalidating the path ensures that the user sees the new poll immediately
  // upon returning to the polls list, without needing a manual refresh.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Retrieves all polls created by the currently authenticated user.
 *
 * This function fetches the polls associated with the logged-in user, ordered by
 * creation date. It's used to populate the user's main dashboard.
 *
 * @returns A promise that resolves to an object containing the user's polls.
 *          If successful, `polls` is an array of poll objects and `error` is `null`.
 *          If an error occurs, `polls` is an empty array and `error` contains a message.
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  // Fetch all polls where the 'user_id' matches the current user's ID.
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: "Failed to fetch polls." };
  return { polls: data ?? [], error: null };
}

/**
 * Retrieves a specific poll by its unique ID.
 *
 * This function is used to fetch the data for a single poll, which is needed
 * for viewing the poll's details, voting, or editing it.
 *
 * @param id - The UUID of the poll to retrieve.
 * @returns A promise that resolves to an object containing the poll data.
 *          If found, `poll` contains the poll object and `error` is `null`.
 *          If not found or an error occurs, `poll` is `null` and `error` has a message.
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: "Poll not found." };
  return { poll: data, error: null };
}

/**
 * Submits a vote for a specific poll option.
 *
 * This action records a vote for a given poll and option. It can be configured
 * to allow anonymous voting or require user authentication.
 *
 * @param pollId - The ID of the poll being voted on.
 * @param optionIndex - The index of the selected option within the poll's options array.
 * @returns A promise that resolves to an object. If successful, `error` is `null`.
 *          If an error occurs, `error` contains a descriptive message.
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This is currently configured to allow anonymous votes.
  // The user_id will be null for non-logged-in users.
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null, 
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: "Failed to submit vote." };
  return { error: null };
}

/**
 * Deletes a poll from the database.
 *
 * This action permanently removes a poll and its associated data. It should only
 * be callable by the user who owns the poll.
 *
 * @param id - The ID of the poll to delete.
 * @returns A promise that resolves to an object. If successful, `error` is `null`.
 *          If an error occurs, `error` contains a descriptive message.
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  // Note: Row Level Security (RLS) in Supabase should be configured to ensure
  // that a user can only delete their own polls.
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: "Failed to delete poll." };

  // Revalidate the path to update the UI.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll with new data.
 *
 * This action allows the poll owner to modify the question and options of a poll
 * they created. It includes validation to ensure the updated data is valid.
 *
 * @param pollId - The ID of the poll to update.
 * @param formData - The form data containing the updated poll question and options.
 * @returns A promise that resolves to an object. If successful, `error` is `null`.
 *          If an error occurs, `error` contains a descriptive message.
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // RLS policies in Supabase ensure that a user can only update a poll
  // if their user_id matches the one on the poll record.
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Failed to update poll." };
  }

  // Revalidate both the main polls page and the specific poll page.
  revalidatePath("/polls");
  revalidatePath(`/polls/${pollId}`);
  return { error: null };
}
'''
''
