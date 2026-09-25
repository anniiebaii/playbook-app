import type { User } from '../../types/models';
import { formatDate } from '../../utils/format';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UserManagementProps {
  members: readonly User[];
  isLoading: boolean;
  error: Error | undefined;
}

export function UserManagement({ members, isLoading, error }: UserManagementProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold">User Management</h2>

      {isLoading && <LoadingSpinner label="Loading users..." />}
      {error && <ErrorMessage message="We couldn't load users right now." />}

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
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
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
                        member.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {member.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
