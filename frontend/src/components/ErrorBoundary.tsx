import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Shows a recovery screen instead of a blank page if rendering throws. */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  override render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 p-4 text-center text-white"
      >
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-white/70">An unexpected error occurred. Reloading usually fixes it.</p>
        <button
          type="button"
          onClick={() => {
            window.location.reload();
          }}
          className="rounded-lg bg-white/20 px-6 py-3 font-semibold transition hover:bg-white/30"
        >
          Reload
        </button>
      </main>
    );
  }
}
