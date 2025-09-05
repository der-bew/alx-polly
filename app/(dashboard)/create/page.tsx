'use client';

import PollCreateForm from "./PollCreateForm";

/**
 * Renders the page for creating a new poll.
 *
 * This component serves as a container for the `PollCreateForm`,
 * providing a title and a consistent layout for the page.
 *
 * @returns {JSX.Element} The rendered create poll page.
 */
export default function CreatePollPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Poll</h1>
      <PollCreateForm />
    </main>
  );
}
