"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";

interface Poll {
  id: string;
  question: string;
  options: any[];
  user_id: string;
}

interface PollActionsProps {
  poll: Poll;
}

/**
 * Renders the actions for a single poll, such as viewing, editing, and deleting.
 *
 * This component displays a summary of a poll and provides action buttons.
 * The edit and delete buttons are only visible to the user who created the poll.
 *
 * @param {object} props - The component props.
 * @param {Poll} props.poll - The poll object.
 * @returns {JSX.Element} The rendered poll actions component.
 */
export default function PollActions({ poll }: PollActionsProps) {
  const { user } = useAuth();

  /**
   * Handles the deletion of the poll.
   *
   * It prompts the user for confirmation before calling the `deletePoll` server action.
   * After deletion, it reloads the page to reflect the change.
   */
  const handleDelete = async () => {
    // WHY: A confirmation dialog prevents accidental deletion of a poll.
    if (confirm("Are you sure you want to delete this poll?")) {
      await deletePoll(poll.id);
      // Reload the page to update the list of polls.
      window.location.reload();
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      {/* WHY: Only show edit/delete buttons to the poll's creator for security.*/}
      {user && user.id === poll.user_id && (
        <div className="flex gap-2 p-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
