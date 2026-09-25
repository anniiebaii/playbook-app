import { Shield } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';

import type { QuestionWithRelations } from '../../types/models';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import { TagList } from '../questions/TagList';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Modal, ModalCloseButton } from '../ui/Modal';

interface QuestionDetailModalProps {
  question: QuestionWithRelations;
  /** Whether the current user may post answers (experts only). */
  canAnswer: boolean;
  onClose: () => void;
  onSubmitAnswer: (content: string) => Promise<void>;
}

export function QuestionDetailModal({
  question,
  canAnswer,
  onClose,
  onSubmitAnswer,
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
