import { X } from 'lucide-react';
import { useEffect } from 'react';

const AUTO_DISMISS_MS = 6000;

/** Transient message pinned to the bottom of the screen. */
export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [message, onDismiss]);

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-red-500/50 bg-red-900/90 px-4 py-3 text-sm text-red-100 shadow-lg"
    >
      {message}
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
