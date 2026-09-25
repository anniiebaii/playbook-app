import { useId, useState, type SubmitEvent } from 'react';

import { getErrorMessage } from '../../utils/errors';
import { ErrorMessage } from '../ui/ErrorMessage';
import { TagSelector } from '../ui/TagSelector';

export interface QuestionDraft {
  title: string;
  description: string;
  tags: string[];
}

interface QuestionFormProps {
  tags: readonly string[];
  titlePlaceholder: string;
  submitLabel: string;
  submitClassName?: string;
  onSubmit: (draft: QuestionDraft) => Promise<void>;
  onCancel: () => void;
}

/** Title, optional details, and at least one tag. Shows submission errors inline. */
export function QuestionForm({
  tags,
  titlePlaceholder,
  submitLabel,
  submitClassName = 'bg-white/20 hover:bg-white/30',
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tagsLabelId = useId();

  const canSubmit = title.trim() !== '' && selectedTags.length > 0 && !isSubmitting;

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), tags: selectedTags });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      <input
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
        }}
        placeholder={titlePlaceholder}
        aria-label="Question"
        required
        autoFocus
        className="mb-4 w-full rounded-lg border border-white/20 bg-white/10 p-4 text-white placeholder-white/60"
      />
      <textarea
        value={description}
        onChange={(event) => {
          setDescription(event.target.value);
        }}
        placeholder="Provide more details (optional)"
        aria-label="Details"
        className="mb-6 min-h-[80px] w-full rounded-lg border border-white/20 bg-white/10 p-4 text-white placeholder-white/60"
      />
      <div role="group" aria-labelledby={tagsLabelId} className="mb-6">
        <p id={tagsLabelId} className="mb-3 text-sm text-white/80">
          Select relevant tags:
        </p>
        <TagSelector tags={tags} selected={selectedTags} onChange={setSelectedTags} />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex-1 rounded-lg py-3 font-semibold transition disabled:opacity-50 ${submitClassName}`}
        >
          {isSubmitting ? 'Sending…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-white/10 py-3 font-semibold transition hover:bg-white/20"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
