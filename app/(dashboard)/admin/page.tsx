"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deletePoll } from "@/app/lib/actions/poll-actions";
import { createClient } from "@/lib/supabase/client";

// SECURITY NOTE: Consider moving Poll interface to a shared types file if used across codebase.
interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  options: string[];
}

// SECURITY IMPROVEMENT: You must ensure only authenticated and authorized users (admins) can access this page.
// In Next.js, this is usually handled in middleware, server actions, or in the layout, but for client components,
// you should double-check that server-side protection exists. Here, add a warning for developers:
if (typeof window !== "undefined" && !window.localStorage.getItem("isAdmin")) {
  // Note: Replace this check with your actual authentication/authorization flow.
  // The following is for demonstration only; do NOT use localStorage for access control in production!
  window.location.href = "/login";
}

export default function AdminPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPolls();
  }, []);

  const fetchAllPolls = async () => {
    try {
      const supabase = createClient();

      // SECURITY: Only fetch if user is authorized (see above).
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // SECURITY: Do not leak internal error details, log for audit, but show generic message
        setErrorMsg("Failed to load polls. Please try again later.");
        setLoading(false);
        return;
      }
      if (data) {
        setPolls(data);
      }
      setLoading(false);
    } catch (e) {
      // Catch unexpected errors
      setErrorMsg("Unexpected error occurred. Please contact admin.");
      setLoading(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    // SECURITY: Confirm deletion with user to prevent accidental deletes (UI/UX improvement)
    if (!window.confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(pollId);
    setErrorMsg(null);
    try {
      const result = await deletePoll(pollId);

      if (result.error) {
        // SECURITY: Avoid leaking details, log for audit, show generic message
        setErrorMsg("Failed to delete poll. Please try again.");
      } else {
        setPolls(polls.filter((poll) => poll.id !== pollId));
      }
    } catch (e) {
      setErrorMsg("Unexpected error occurred during delete. Please contact admin.");
    }
    setDeleteLoading(null);
  };

  if (loading) {
    return <div className="p-6">Loading all polls...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          View and manage all polls in the system.
        </p>
        {/* SECURITY: Display error messages in a user-friendly way */}
        {errorMsg && (
          <div className="text-red-600 py-2" role="alert">
            {errorMsg}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {polls.map((poll) => (
          <Card key={poll.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  {/* SECURITY: Sanitize output if poll.question/user_id/id/options are user-supplied */}
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1 mt-2">
                      <div>
                        Poll ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {poll.id}
                        </code>
                      </div>
                      <div>
                        Owner ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {poll.user_id}
                        </code>
                      </div>
                      <div>
                        Created:{" "}
                        {new Date(poll.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(poll.id)}
                  disabled={deleteLoading === poll.id}
                  aria-label={`Delete poll ${poll.id}`}
                >
                  {deleteLoading === poll.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Options:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {/* SECURITY: Sanitize output if poll.options are user-supplied */}
                  {poll.options.map((option, index) => (
                    <li key={index} className="text-gray-700">
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {polls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No polls found in the system.
        </div>
      )}
    </div>
  );
}

/*
SECURITY AUDIT SUMMARY:
1. **Authorization**: The page must be protected so only admin users can access it. This must be enforced server-side (middleware, API route, or server action).
2. **Error Handling**: Do not leak internal errors to users; log for audit, show generic messages.
3. **Output Sanitization**: If poll/question/options/user_id/id are user-supplied, ensure output is properly escaped/sanitized to prevent XSS. React escapes output by default, but be careful with dangerouslySetInnerHTML.
4. **Delete Confirmation**: Added a confirmation prompt to prevent accidental deletions.
5. **Accessibility**: Added aria-label to Delete button.
6. **Sensitive Data**: Only display required fields; avoid exposing internal IDs if not needed.
7. **Client-Side Admin Check (Example)**: Shown for demonstration, not for production. Replace with a secure session-based check.
8. **Audit Logging**: All destructive actions (deletes) should be logged on the backend for auditing.
9. **Rate Limiting**: Ensure API endpoints are rate-limited to avoid abuse.
10. **CSRF**: Ensure all destructive actions are protected by CSRF tokens on the backend.

**Follow-up**: Move admin access checks and poll operations to server actions or API routes, protected by secure authentication and authorization. Regularly audit logs and monitor usage.
*/
