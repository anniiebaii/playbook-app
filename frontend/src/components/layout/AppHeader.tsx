import { Bell, LayoutDashboard, LogIn, LogOut, User as UserIcon } from 'lucide-react';

import type { User } from '../../types/models';

interface AppHeaderProps {
  currentUser: User | null;
  unreadNotificationCount: number;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
}

export function AppHeader({
  currentUser,
  unreadNotificationCount,
  onSignIn,
  onSignOut,
  onOpenAdmin,
  onOpenNotifications,
}: AppHeaderProps) {
  return (
    <header className="mb-12 flex items-center justify-between">
      <h1 className="text-4xl font-bold">Playbook</h1>
      <nav className="flex items-center gap-4">
        {currentUser ? (
          <>
            {currentUser.isAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="rounded-lg bg-yellow-500/20 px-3 py-1 transition hover:bg-yellow-500/30"
              >
                <LayoutDashboard className="mr-1 inline h-4 w-4" aria-hidden="true" />
                Admin Panel
              </button>
            )}
            <span className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" aria-hidden="true" />
              {currentUser.name}
            </span>
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label={`Notifications (${String(unreadNotificationCount)} unread)`}
              className="relative rounded-lg p-2 transition hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="rounded-lg p-2 transition hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-lg bg-white/10 px-4 py-2 transition hover:bg-white/20"
          >
            <LogIn className="mr-2 inline h-5 w-5" aria-hidden="true" />
            Login
          </button>
        )}
      </nav>
    </header>
  );
}
