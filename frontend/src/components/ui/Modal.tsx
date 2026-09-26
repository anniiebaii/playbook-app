import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  /** `id` of the element that names the dialog, for screen readers. */
  labelledBy: string;
  onClose: () => void;
  /** Size and padding classes for the dialog panel. */
  className?: string;
  children: ReactNode;
}

/** Accessible modal dialog: closes on Escape or a click on the backdrop. */
export function Modal({ labelledBy, onClose, className = 'max-w-2xl p-8', children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalCloseButton({
  onClick,
  className = '',
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={`rounded-lg p-2 transition hover:bg-white/10 ${className}`}
    >
      <X className="h-6 w-6" />
    </button>
  );
}
