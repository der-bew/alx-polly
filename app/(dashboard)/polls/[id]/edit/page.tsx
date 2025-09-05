import { getPollById } from '@/app/lib/actions/poll-actions';
import { notFound } from 'next/navigation';
import EditPollForm from './EditPollForm';

/**
 * Renders the page for editing a specific poll.
 *
 * This server component fetches the poll data using the `getPollById` action.
 * If the poll is not found, it renders a 404 page. Otherwise, it renders the
 * `EditPollForm` client component, passing the poll data to it.
 *
 * @param {object} props - The component props.
 * @param {object} props.params - The route parameters, containing the poll ID.
 * @param {string} props.params.id - The ID of the poll to edit.
 * @returns {Promise<JSX.Element>} The rendered edit poll page.
 */
export default async function EditPollPage({ params }: { params: { id: string } }) {
  const { poll, error } = await getPollById(params.id);

  // If the poll doesn't exist or there was an error, show a 404 page.
  // This prevents users from accessing edit pages for polls that don't exist.
  if (error || !poll) {
    notFound();
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Poll</h1>
      <EditPollForm poll={poll} />
    </div>
  );
}
