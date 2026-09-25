import { useId } from 'react';

import { QuestionForm, type QuestionDraft } from '../questions/QuestionForm';
import { Modal } from '../ui/Modal';

interface AskQuestionModalProps {
  tags: readonly string[];
  onClose: () => void;
  onSubmit: (draft: QuestionDraft) => Promise<void>;
}

export function AskQuestionModal({ tags, onClose, onSubmit }: AskQuestionModalProps) {
  const headingId = useId();

  return (
    <Modal labelledBy={headingId} onClose={onClose}>
      <h2 id={headingId} className="mb-6 text-2xl font-bold">
        Ask a Question
      </h2>
      <QuestionForm
        tags={tags}
        titlePlaceholder="What's your question?"
        submitLabel="Post Question"
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
