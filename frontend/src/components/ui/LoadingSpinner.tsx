export function LoadingSpinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      <span className="text-lg font-medium text-white/80">{label}</span>
    </div>
  );
}
