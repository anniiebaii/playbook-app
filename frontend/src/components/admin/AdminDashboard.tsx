import { ChartColumn, Clock, MessageSquare, Users } from 'lucide-react';

import type { QuestionWithRelations } from '../../types/models';
import { formatRelativeTime } from '../../utils/format';
import { StatCard } from './StatCard';
import { StatusBadge } from './StatusBadge';

const RECENT_ACTIVITY_LIMIT = 5;

interface AdminDashboardProps {
  questions: readonly QuestionWithRelations[];
  memberCount: number;
  onViewAllQuestions: () => void;
  onViewPendingQuestions: () => void;
  onViewUsers: () => void;
}

export function AdminDashboard({
  questions,
  memberCount,
  onViewAllQuestions,
  onViewPendingQuestions,
  onViewUsers,
}: AdminDashboardProps) {
  const pendingCount = questions.filter((q) => q.status === 'PENDING').length;
  const totalViews = questions.reduce((total, q) => total + q.views, 0);

  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          icon={MessageSquare}
          value={questions.length}
          label="Total Questions"
          theme="blue"
          action={{ label: 'Click to view all', onClick: onViewAllQuestions }}
        />
        <StatCard
          icon={Clock}
          value={pendingCount}
          label="Pending Questions"
          theme="orange"
          action={{ label: 'Click to view', onClick: onViewPendingQuestions }}
        />
        <StatCard
          icon={Users}
          value={memberCount}
          label="Members"
          theme="green"
          action={{ label: 'Click to manage', onClick: onViewUsers }}
        />
        <StatCard icon={ChartColumn} value={totalViews} label="Total Views" theme="purple" />
      </div>

      <section className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <ul className="space-y-4">
          {questions.slice(0, RECENT_ACTIVITY_LIMIT).map((question) => (
            <li
              key={question.id}
              className="flex items-center justify-between rounded-lg bg-white/5 p-4"
            >
              <div>
                <h3 className="font-semibold">{question.text}</h3>
                <p className="mt-1 text-sm text-white/60">
                  {question.author.name} • {formatRelativeTime(question.createdAt)}
                </p>
              </div>
              <StatusBadge status={question.status} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
