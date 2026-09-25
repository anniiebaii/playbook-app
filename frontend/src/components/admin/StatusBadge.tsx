import type { QuestionStatus } from '../../types/models';

export function StatusBadge({ status }: { status: QuestionStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${
        status === 'ANSWERED'
          ? 'bg-green-500/20 text-green-300'
          : 'bg-orange-500/20 text-orange-300'
      }`}
    >
      {status === 'ANSWERED' ? 'Answered' : 'Pending'}
    </span>
  );
}
