import { Shield } from 'lucide-react';
import { useId } from 'react';

import type { ExpertProfile } from '../../types/models';
import { ExpertiseList } from '../experts/ExpertiseList';
import { Avatar } from '../ui/Avatar';
import { Modal, ModalCloseButton } from '../ui/Modal';

interface ExpertProfileModalProps {
  expert: ExpertProfile;
  onClose: () => void;
  onAsk: () => void;
}

export function ExpertProfileModal({ expert, onClose, onAsk }: ExpertProfileModalProps) {
  const headingId = useId();

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      className="max-h-[90vh] max-w-4xl overflow-y-auto"
    >
      <div className="relative border-b border-white/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-8">
        <ModalCloseButton onClick={onClose} className="absolute right-4 top-4" />
        <div className="flex items-center gap-6">
          <Avatar user={expert} size="lg" />
          <div>
            <h2 id={headingId} className="flex items-center gap-3 text-3xl font-bold">
              {expert.name}
              <Shield className="h-6 w-6 text-yellow-400" aria-label="Verified expert" />
            </h2>
            <p className="mt-1 text-xl text-white/80">{expert.title ?? 'Expert Advisor'}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {expert.bio && <p className="mb-4 text-white/80">{expert.bio}</p>}
        <ExpertiseList expertise={expert.expertise} />
        <button
          type="button"
          onClick={onAsk}
          className="w-full rounded-lg bg-blue-500/20 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/30"
        >
          Ask {expert.name} a Question
        </button>
      </div>
    </Modal>
  );
}
