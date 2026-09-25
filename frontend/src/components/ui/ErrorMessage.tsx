export function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-200"
    >
      {message}
    </div>
  );
}
