import { CircleCheckBig } from 'lucide-react';
import { useId, useState } from 'react';

import { DEFAULT_EXPERT_RESPONSE_TIME } from '../../constants';
import type { ExpertProfile } from '../../types/models';
import { QuestionForm, type QuestionDraft } from '../questions/QuestionForm';
import { Modal } from '../ui/Modal';

interface AskExpertModalProps {
  expert: ExpertProfile;
  tags: readonly string[];
  onClose: () => void;
  onSubmit: (draft: QuestionDraft) => Promise<void>;
}

/** Sends a question assigned to a specific expert, then confirms it was sent. */
export function AskExpertModal({ expert, tags, onClose, onSubmit }: AskExpertModalProps) {
  const headingId = useId();
  const [isSent, setIsSent] = useState(false);

  return (
    <Modal labelledBy={headingId} onClose={onClose}>
      <h2 id={headingId} className="mb-2 text-2xl font-bold">
        Ask {expert.name}
      </h2>
      <p className="mb-6 text-white/70">
        {expert.title ?? 'Expert Advisor'} • Responds in{' '}
        {expert.responseTime ?? DEFAULT_EXPERT_RESPONSE_TIME}
      </p>

      {isSent ? (
        <div role="status" className="text-center">
          <CircleCheckBig className="mx-auto mb-4 h-12 w-12 text-green-400" aria-hidden="true" />
          <p className="mb-6 text-lg">Your question has been sent to {expert.name}!</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-white/20 py-3 font-semibold transition hover:bg-white/30"
          >
            Done
          </button>
        </div>
      ) : (
        <QuestionForm
          tags={tags}
          titlePlaceholder={`What would you like to ask ${expert.name}?`}
          submitLabel="Send Question"
          submitClassName="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
          onSubmit={async (draft) => {
            await onSubmit(draft);
            setIsSent(true);
          }}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
