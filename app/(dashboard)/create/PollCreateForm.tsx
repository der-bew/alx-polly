"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_OPTIONS = 10;
const MAX_QUESTION_LENGTH = 200;
const MAX_OPTION_LENGTH = 100;

/**
 * Renders a form for creating a new poll.
 *
 * This client component manages the state for the poll's question and options.
 * It provides functionality to dynamically add and remove options, and it handles
 * form submission by calling the `createPoll` server action.
 *
 * @returns {JSX.Element} The rendered poll creation form.
 */
export default function PollCreateForm() {
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Updates the value of a specific option.
   * @param {number} idx - The index of the option to update.
   * @param {string} value - The new value for the option.
   */
  const handleOptionChange = (idx: number, value: string) => {
    if (value.length <= MAX_OPTION_LENGTH) {
      setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
    }
  };

  /**
   * Adds a new, empty option field to the form.
   */
  const addOption = () => setOptions((opts) => (opts.length < MAX_OPTIONS ? [...opts, ""] : opts));

  /**
   * Removes an option field from the form.
   * @param {number} idx - The index of the option to remove.
   */
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

        // Client-side validation for immediate user feedback.
        const question = formData.get("question") as string;
        const opts = options.filter((opt) => opt.trim().length > 0);
        if (!question || question.length > MAX_QUESTION_LENGTH) {
          setError(`Question is required and must be under ${MAX_QUESTION_LENGTH} characters.`);
          return;
        }
        if (opts.length < 2 || opts.length > MAX_OPTIONS) {
          setError(`Provide between 2 and ${MAX_OPTIONS} options.`);
          return;
        }
        if (opts.some((opt) => opt.length > MAX_OPTION_LENGTH)) {
          setError(`Each option must be under ${MAX_OPTION_LENGTH} characters.`);
          return;
        }

        // The server action will perform its own validation as well.
        const res = await createPoll(formData);
        if (res?.error) {
          setError("Unable to create poll. Please try again.");
        } else {
          setSuccess(true);
          // Redirect after a short delay to show the success message.
          setTimeout(() => {
            window.location.href = "/polls";
          }, 1200);
        }
      }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input
          name="question"
          id="question"
          required
          maxLength={MAX_QUESTION_LENGTH}
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
              maxLength={MAX_OPTION_LENGTH}
            />
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          onClick={addOption}
          variant="secondary"
          disabled={options.length >= MAX_OPTIONS}
        >
          Add Option
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Poll created! Redirecting...</div>}
      <Button type="submit">Create Poll</Button>
    </form>
  );
}
