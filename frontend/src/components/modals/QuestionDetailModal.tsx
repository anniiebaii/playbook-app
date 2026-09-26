import { Shield, Trash } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';

import type { QuestionWithRelations } from '../../types/models';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import { describeDeletion } from '../../utils/questions';
import { TagList } from '../questions/TagList';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Modal, ModalCloseButton } from '../ui/Modal';

interface QuestionDetailModalProps {
  question: QuestionWithRelations;
  /** Whether the current user may post answers (experts only). */
  canAnswer: boolean;
  /** Whether the current user may delete the question (experts only). */
  canDelete: boolean;
  onClose: () => void;
  onSubmitAnswer: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function QuestionDetailModal({
  question,
  canAnswer,
  canDelete,
  onClose,
  onSubmitAnswer,
  onDelete,
}: QuestionDetailModalProps) {
  const headingId = useId();

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      className="max-h-[90vh] max-w-4xl overflow-y-auto p-8"
    >
      <div className="mb-6 flex items-start justify-between">
        <h2 id={headingId} className="pr-4 text-3xl font-bold">
          {question.text}
        </h2>
        <ModalCloseButton onClick={onClose} />
      </div>

      {question.description && <p className="mb-6 text-white/80">{question.description}</p>}

      <div className="mb-6 flex items-center gap-4 text-white/80">
        <span>
          {question.author.name}, {question.role}
        </span>
        <span aria-hidden="true">•</span>
        <time dateTime={question.createdAt}>{formatDate(question.createdAt)}</time>
      </div>

      <div className="mb-8">
        <TagList tags={question.tags} />
      </div>

      <section className="border-t border-white/20 pt-6">
        <h3 className="mb-4 text-xl font-semibold">Answers ({question.answers.length})</h3>

        {question.answers.map((answer) => (
          <article key={answer.id} className="mb-6 rounded-lg bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              {answer.author.isAdmin && (
                <Shield className="h-4 w-4 text-yellow-400" aria-label="Expert" />
              )}
              <span className="font-semibold">{answer.author.name}</span>
              <time dateTime={answer.createdAt} className="text-sm text-white/60">
                {formatDate(answer.createdAt)}
              </time>
            </div>
            <p className="whitespace-pre-line text-white/90">{answer.content}</p>
          </article>
        ))}

        {canAnswer && <AnswerForm onSubmit={onSubmitAnswer} />}
      </section>

      {canDelete && <DeleteQuestionControl question={question} onDelete={onDelete} />}
    </Modal>
  );
}

function AnswerForm({ onSubmit }: { onSubmit: (content: string) => Promise<void> }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(content.trim());
      setContent('');
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
      className="mt-6 rounded-lg bg-white/5 p-4"
    >
      <h4 className="mb-3 flex items-center gap-2 font-semibold">
        <Shield className="h-4 w-4 text-yellow-400" aria-hidden="true" />
        Add Expert Answer
      </h4>
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      <textarea
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
        }}
        placeholder="Type your answer..."
        aria-label="Your answer"
        className="mb-4 min-h-[100px] w-full rounded-lg border border-white/20 bg-white/10 p-3 text-white placeholder-white/60"
      />
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="w-full rounded-lg bg-white/20 py-3 font-semibold transition hover:bg-white/30 disabled:opacity-50"
      >
        {isSubmitting ? 'Posting…' : 'Post Answer'}
      </button>
    </form>
  );
}

/**
 * Inline confirmation rather than a second dialog: stacked dialogs would both close on a
 * single Escape press.
 */
function DeleteQuestionControl({
  question,
  onDelete,
}: {
  question: QuestionWithRelations;
  onDelete: () => Promise<void>;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      setIsDeleting(false);
    }
  };

  if (!isConfirming) {
    return (
      <div className="mt-6 flex justify-end border-t border-white/20 pt-6">
        <button
          type="button"
          onClick={() => {
            setIsConfirming(true);
          }}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
        >
          <Trash className="h-4 w-4" aria-hidden="true" />
          Delete question
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirm deletion"
      className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4"
    >
      <p className="mb-4 text-sm text-red-100">{describeDeletion(question)}</p>
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            void confirmDelete();
          }}
          className="rounded-lg bg-red-500/30 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/40 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting…' : 'Delete permanently'}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            setIsConfirming(false);
            setError(null);
          }}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
