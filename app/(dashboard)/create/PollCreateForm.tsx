"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_OPTIONS = 10;
const MAX_QUESTION_LENGTH = 200;
const MAX_OPTION_LENGTH = 100;

export default function PollCreateForm() {
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOptionChange = (idx: number, value: string) => {
    if (value.length <= MAX_OPTION_LENGTH) {
      setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
    }
  };

  const addOption = () => setOptions((opts) => (opts.length < MAX_OPTIONS ? [...opts, ""] : opts));
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

        // Client-side validation (additional)
        const question = formData.get("question") as string;
        const opts = options.filter((opt) => opt.trim().length > 0);
        if (!question || question.length > MAX_QUESTION_LENGTH) {
          setError("Question is required and must be under 200 characters.");
          return;
        }
        if (opts.length < 2 || opts.length > MAX_OPTIONS) {
          setError(`Provide between 2 and ${MAX_OPTIONS} options.`);
          return;
        }
        if (opts.some((opt) => opt.length > MAX_OPTION_LENGTH)) {
          setError("Each option must be under 100 characters.");
          return;
        }

        const res = await createPoll(formData);
        if (res?.error) {
          setError("Unable to create poll. Please try again."); // Don't show raw error
        } else {
          setSuccess(true);
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
