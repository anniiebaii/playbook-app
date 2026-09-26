import { CircleQuestionMark, MessageSquare, ThumbsUp, type LucideIcon } from 'lucide-react';
import { useId } from 'react';

import type { Notification, NotificationType } from '../../types/models';
import { formatRelativeTime } from '../../utils/format';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Modal, ModalCloseButton } from '../ui/Modal';

const NOTIFICATION_STYLES: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  ANSWER: { icon: MessageSquare, color: 'text-blue-400' },
  QUESTION: { icon: CircleQuestionMark, color: 'text-purple-400' },
  UPVOTE: { icon: ThumbsUp, color: 'text-green-400' },
};

interface NotificationsModalProps {
  notifications: readonly Notification[];
  isLoading: boolean;
  onClose: () => void;
}

export function NotificationsModal({ notifications, isLoading, onClose }: NotificationsModalProps) {
  const headingId = useId();

  return (
    <Modal labelledBy={headingId} onClose={onClose} className="max-w-md">
      <div className="flex items-center justify-between border-b border-white/20 p-6">
        <h2 id={headingId} className="text-2xl font-bold">
          Notifications
        </h2>
        <ModalCloseButton onClick={onClose} />
      </div>
      <div className="max-h-96 space-y-4 overflow-y-auto p-6">
        {isLoading && <LoadingSpinner label="Loading notifications..." />}
        {!isLoading && notifications.length === 0 && (
          <p className="text-center text-white/60">You&apos;re all caught up.</p>
        )}
        {notifications.map((notification) => {
          const { icon: Icon, color } = NOTIFICATION_STYLES[notification.type];
          return (
            <div key={notification.id} className="flex gap-3">
              <div className={`h-fit rounded-lg bg-white/10 p-2 ${color}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-sm text-white/80">{notification.message}</p>
                <time dateTime={notification.createdAt} className="text-xs text-white/60">
                  {formatRelativeTime(notification.createdAt)}
                </time>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
