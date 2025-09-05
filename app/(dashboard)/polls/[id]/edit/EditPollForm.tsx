'use client';

import { useState } from 'react';
import { updatePoll } from '@/app/lib/actions/poll-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Renders a form for editing an existing poll.
 *
 * This component is pre-populated with the existing poll data. It allows the user
 * to modify the question and options, and then submit the changes via the
 * `updatePoll` server action.
 *
 * @param {object} props - The component props.
 * @param {any} props.poll - The poll object to be edited.
 * @returns {JSX.Element} The rendered poll editing form.
 */
export default function EditPollForm({ poll }: { poll: any }) {
  const [question, setQuestion] = useState(poll.question);
  const [options, setOptions] = useState<string[]>(poll.options || []);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOption = () => setOptions((opts) => [...opts, '']);
  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      action={async (formData) => {
        setError(null);
        setSuccess(false);

        // Manually construct the FormData to be sent to the server action.
        const updatedFormData = new FormData();
        updatedFormData.set('question', question);
        options.forEach((opt) => updatedFormData.append('options', opt));

        const res = await updatePoll(poll.id, updatedFormData);
        if (res?.error) {
          setError(res.error);
        } else {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/polls';
          }, 1200);
        }
      }}
      className="space-y-6"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input
          name="question"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Poll updated! Redirecting...</div>}
      <Button type="submit">Update Poll</Button>
    </form>
  );
}
