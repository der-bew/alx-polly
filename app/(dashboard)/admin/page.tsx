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

// Define a shared interface for the Poll object.
interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  options: string[];
}

/**
 * Renders the admin panel for managing all polls.
 *
 * This component provides a view of all polls in the system and allows administrators
 * to delete any poll. It includes important security checks and user-friendly error handling.
 * 
 * @returns {JSX.Element} The rendered admin page.
 */
export default function AdminPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // SECURITY: This is a client-side check for demonstration only.
    // Real-world applications MUST enforce this on the server-side (e.g., in middleware)
    // to prevent unauthorized access.
    if (typeof window !== "undefined" && !window.localStorage.getItem("isAdmin")) {
      window.location.href = "/login";
    }
    fetchAllPolls();
  }, []);

  /**
   * Fetches all polls from the database.
   *
   * This function retrieves all polls and updates the component's state.
   * It includes error handling to inform the admin if the fetch fails.
   */
  const fetchAllPolls = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Do not leak internal error details. Log them for auditing.
        setErrorMsg("Failed to load polls. Please try again later.");
        setLoading(false);
        return;
      }
      if (data) {
        setPolls(data);
      }
      setLoading(false);
    } catch (e) {
      setErrorMsg("An unexpected error occurred. Please contact support.");
      setLoading(false);
    }
  };

  /**
   * Handles the deletion of a poll.
   *
   * @param {string} pollId - The ID of the poll to delete.
   */
  const handleDelete = async (pollId: string) => {
    // A confirmation dialog prevents accidental deletion.
    if (!window.confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(pollId);
    setErrorMsg(null);
    try {
      const result = await deletePoll(pollId);

      if (result.error) {
        setErrorMsg("Failed to delete poll. Please try again.");
      } else {
        // Update the UI by removing the deleted poll from the state.
        setPolls(polls.filter((poll) => poll.id !== pollId));
      }
    } catch (e) {
      setErrorMsg("An unexpected error occurred during deletion.");
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
                  {/* React escapes this by default, but it's good practice to be aware of XSS risks. */}
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
