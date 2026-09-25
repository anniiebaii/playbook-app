import type { UserSummary } from '../../types/models';
import { getInitials } from '../../utils/format';

const SIZES = {
  md: 'h-16 w-16 text-2xl',
  lg: 'h-24 w-24 text-4xl',
} as const;

/** Shows the user's avatar text (e.g. initials or an emoji), falling back to their initials. */
export function Avatar({ user, size = 'md' }: { user: UserSummary; size?: keyof typeof SIZES }) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold ${SIZES[size]}`}
    >
      {user.avatar ?? getInitials(user.name)}
    </div>
  );
}
