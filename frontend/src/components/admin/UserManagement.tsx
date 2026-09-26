import { useState } from 'react';

import type { User, UserStatus } from '../../types/models';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UserManagementProps {
  members: readonly User[];
  isLoading: boolean;
  error: Error | undefined;
  onSetStatus: (member: User, status: UserStatus) => Promise<void>;
  onDelete: (member: User) => Promise<void>;
}

const actionButtonClass = 'rounded px-3 py-1 text-sm transition disabled:opacity-50';

export function UserManagement({
  members,
  isLoading,
  error,
  onSetStatus,
  onDelete,
}: UserManagementProps) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

  const toggleStatus = async (member: User) => {
    setPendingUserId(member.id);
    setActionError(null);
    try {
      await onSetStatus(member, member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    } catch (statusError) {
      setActionError(getErrorMessage(statusError));
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold">User Management</h2>

      {isLoading && <LoadingSpinner label="Loading users..." />}
      {error && <ErrorMessage message="We couldn't load users right now." />}
      {actionError && (
        <div className="mb-4">
          <ErrorMessage message={actionError} />
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th scope="col" className="px-4 py-3">
                  User
                </th>
                <th scope="col" className="px-4 py-3">
                  Joined
                </th>
                <th scope="col" className="px-4 py-3">
                  Points
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isActive = member.status === 'ACTIVE';
                const isPending = pendingUserId === member.id;
                return (
                  <tr key={member.id} className="border-b border-white/10">
                    <td className="px-4 py-3">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-white/60">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(member.createdAt)}</td>
                    <td className="px-4 py-3">{member.points}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          isActive ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          aria-label={`${isActive ? 'Deactivate' : 'Reactivate'} ${member.name}`}
                          onClick={() => {
                            void toggleStatus(member);
                          }}
                          className={`${actionButtonClass} ${
                            isActive
                              ? 'bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30'
                              : 'bg-green-500/20 text-green-200 hover:bg-green-500/30'
                          }`}
                        >
                          {isPending ? 'Saving…' : isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          aria-label={`Delete ${member.name}`}
                          onClick={() => {
                            setActionError(null);
                            setMemberToDelete(member);
                          }}
                          className={`${actionButtonClass} bg-red-500/20 text-red-200 hover:bg-red-500/30`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {memberToDelete && (
        <ConfirmDialog
          title={`Delete ${memberToDelete.name}?`}
          confirmLabel="Delete permanently"
          onCancel={() => {
            setMemberToDelete(null);
          }}
          onConfirm={async () => {
            await onDelete(memberToDelete);
            setMemberToDelete(null);
          }}
        >
          <p>
            This permanently deletes their account and everything they created: their questions
            (including answers on them), answers, upvotes, bookmarks, and notifications. This
            can&apos;t be undone.
          </p>
          <p className="mt-2 text-sm text-white/60">
            To block access but keep their content, deactivate the account instead.
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
