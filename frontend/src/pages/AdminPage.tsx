import { LogOut, Shield } from 'lucide-react';
import { useState } from 'react';

import { deleteUser, fetchAllUsers, setUserStatus } from '../api/users';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { QuestionManagement, type StatusFilter } from '../components/admin/QuestionManagement';
import { UserManagement } from '../components/admin/UserManagement';
import { useAsyncData } from '../hooks/useAsyncData';
import type { QuestionWithRelations, User, UserStatus } from '../types/models';

type AdminTab = 'dashboard' | 'questions' | 'users';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'questions', label: 'Questions' },
  { id: 'users', label: 'Users' },
];

interface AdminPageProps {
  questions: readonly QuestionWithRelations[];
  onOpenQuestion: (questionId: number) => void;
  onExit: () => void;
  onSignOut: () => void;
  /** Called after a user and their content are deleted, so shared data can refresh. */
  onUserDeleted: () => void;
}

export function AdminPage({
  questions,
  onOpenQuestion,
  onExit,
  onSignOut,
  onUserDeleted,
}: AdminPageProps) {
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
    mutate: mutateUsers,
  } = useAsyncData(fetchAllUsers);
  const members = (users ?? []).filter((user) => !user.isAdmin);

  const changeStatus = async (member: User, status: UserStatus) => {
    await setUserStatus(member.id, status);
    mutateUsers((list) => list.map((user) => (user.id === member.id ? { ...user, status } : user)));
  };

  const removeUser = async (member: User) => {
    await deleteUser(member.id);
    mutateUsers((list) => list.filter((user) => user.id !== member.id));
    onUserDeleted();
  };

  const showQuestions = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setTab('questions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Shield className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              Admin Dashboard
            </h1>
            <nav className="flex gap-2">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? 'page' : undefined}
                  onClick={() => {
                    setTab(id);
                  }}
                  className={`rounded-lg px-3 py-1 transition ${
                    tab === id ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onExit}
              className="rounded-lg bg-white/10 px-3 py-1 transition hover:bg-white/20"
            >
              Switch to User View
            </button>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="rounded-lg p-2 transition hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {tab === 'dashboard' && (
          <AdminDashboard
            questions={questions}
            memberCount={members.length}
            onViewAllQuestions={() => {
              showQuestions('ALL');
            }}
            onViewPendingQuestions={() => {
              showQuestions('PENDING');
            }}
            onViewUsers={() => {
              setTab('users');
            }}
          />
        )}
        {tab === 'questions' && (
          <QuestionManagement
            questions={questions}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onOpenQuestion={onOpenQuestion}
          />
        )}
        {tab === 'users' && (
          <UserManagement
            members={members}
            isLoading={isLoadingUsers}
            error={usersError}
            onSetStatus={changeStatus}
            onDelete={removeUser}
          />
        )}
      </main>
    </div>
  );
}
