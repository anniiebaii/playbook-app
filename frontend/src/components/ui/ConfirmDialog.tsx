import { useId, useState, type ReactNode } from 'react';

import { getErrorMessage } from '../../utils/errors';
import { ErrorMessage } from './ErrorMessage';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Resolves when the action succeeds; a rejection is shown in the dialog. */
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/** Asks the user to confirm a destructive action, staying open to show any failure. */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const headingId = useId();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      await onConfirm();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
      setIsConfirming(false);
    }
  };

  return (
    <Modal labelledBy={headingId} onClose={onCancel} className="max-w-md p-6">
      <h2 id={headingId} className="mb-3 text-xl font-bold">
        {title}
      </h2>
      <div className="mb-6 text-white/80">{children}</div>
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            void confirm();
          }}
          disabled={isConfirming}
          className="flex-1 rounded-lg bg-red-500/30 py-3 font-semibold text-red-100 transition hover:bg-red-500/40 disabled:opacity-50"
        >
          {isConfirming ? 'Working…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isConfirming}
          className="flex-1 rounded-lg bg-white/10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
