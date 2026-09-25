import type { QuestionStatus, QuestionWithRelations } from '../../types/models';
import { formatRelativeTime } from '../../utils/format';
import { StatusBadge } from './StatusBadge';

export type StatusFilter = QuestionStatus | 'ALL';

interface QuestionManagementProps {
  questions: readonly QuestionWithRelations[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onOpenQuestion: (questionId: number) => void;
}

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Questions' },
  { value: 'PENDING', label: 'Pending Only' },
  { value: 'ANSWERED', label: 'Answered Only' },
];

export function QuestionManagement({
  questions,
  statusFilter,
  onStatusFilterChange,
  onOpenQuestion,
}: QuestionManagementProps) {
  const filtered =
    statusFilter === 'ALL' ? questions : questions.filter((q) => q.status === statusFilter);

  return (
    <section className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Question Management</h2>
        <select
          value={statusFilter}
          onChange={(event) => {
            onStatusFilterChange(event.target.value as StatusFilter);
          }}
          aria-label="Filter by status"
          className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white"
        >
          {FILTER_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="text-black">
              {label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && <p className="text-white/60">No questions match this filter.</p>}

      <ul className="space-y-4">
        {filtered.map((question) => (
          <li
            key={question.id}
            className="flex items-start justify-between gap-4 rounded-lg bg-white/5 p-4"
          >
            <div>
              <h3 className="font-semibold">{question.text}</h3>
              <p className="mt-1 text-sm text-white/60">
                {question.author.name} • {formatRelativeTime(question.createdAt)}
                {question.assignedTo && ` • Assigned to ${question.assignedTo.name}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={question.status} />
              <button
                type="button"
                onClick={() => {
                  onOpenQuestion(question.id);
                }}
                className="rounded bg-blue-500/20 px-3 py-1 text-sm transition hover:bg-blue-500/30"
              >
                {question.status === 'ANSWERED' ? 'View' : 'Answer'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
