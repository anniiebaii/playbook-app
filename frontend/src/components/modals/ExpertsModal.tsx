import { Shield, Star } from 'lucide-react';
import { useId } from 'react';

import { DEFAULT_EXPERT_RESPONSE_TIME } from '../../constants';
import type { ExpertProfile } from '../../types/models';
import { ExpertiseList } from '../experts/ExpertiseList';
import { Avatar } from '../ui/Avatar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Modal, ModalCloseButton } from '../ui/Modal';

interface ExpertsModalProps {
  experts: readonly ExpertProfile[];
  isLoading: boolean;
  onClose: () => void;
  onViewProfile: (expert: ExpertProfile) => void;
  onAsk: (expert: ExpertProfile) => void;
}

export function ExpertsModal({
  experts,
  isLoading,
  onClose,
  onViewProfile,
  onAsk,
}: ExpertsModalProps) {
  const headingId = useId();

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      className="max-h-[90vh] max-w-6xl overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/20 p-6">
        <h2 id={headingId} className="text-3xl font-bold">
          Meet Our Expert Advisors
        </h2>
        <ModalCloseButton onClick={onClose} />
      </div>

      {isLoading && <LoadingSpinner label="Loading experts..." />}
      {!isLoading && experts.length === 0 && (
        <p className="p-6 text-center text-white/60">No expert advisors yet.</p>
      )}

      <div className="grid max-h-[calc(90vh-100px)] grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-2">
        {experts.map((expert) => (
          <article
            key={expert.id}
            className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <div className="mb-4 flex items-start gap-4">
              <Avatar user={expert} />
              <div className="flex-1">
                <h3 className="flex items-center gap-2 text-xl font-semibold">
                  {expert.name}
                  <Shield className="h-5 w-5 text-yellow-400" aria-label="Verified expert" />
                </h3>
                <p className="text-white/80">{expert.title ?? 'Expert Advisor'}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-white/60">
                  {expert.rating !== null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" aria-hidden="true" />
                      {expert.rating.toFixed(1)}
                    </span>
                  )}
                  <span>{expert.responseTime ?? DEFAULT_EXPERT_RESPONSE_TIME}</span>
                </div>
              </div>
            </div>
            <p className="mb-4 text-white/80">
              {expert.bio ?? 'Experienced professional ready to help.'}
            </p>
            <ExpertiseList expertise={expert.expertise} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onViewProfile(expert);
                }}
                className="flex-1 rounded-lg bg-white/10 py-2 transition hover:bg-white/20"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  onAsk(expert);
                }}
                className="flex-1 rounded-lg bg-blue-500/20 py-2 text-blue-300 transition hover:bg-blue-500/30"
              >
                Ask Question
              </button>
            </div>
          </article>
        ))}
      </div>
    </Modal>
  );
}
