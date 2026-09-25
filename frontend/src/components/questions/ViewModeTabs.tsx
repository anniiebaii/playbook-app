import type { ViewMode } from '../../utils/questions';

interface ViewModeTabsProps {
  viewMode: ViewMode;
  unansweredCount: number;
  onChange: (viewMode: ViewMode) => void;
}

export function ViewModeTabs({ viewMode, unansweredCount, onChange }: ViewModeTabsProps) {
  const tabs: { mode: ViewMode; label: string }[] = [
    { mode: 'trending', label: 'Trending' },
    { mode: 'recent', label: 'Recent' },
    { mode: 'unanswered', label: `Unanswered (${String(unansweredCount)})` },
  ];

  return (
    <div role="tablist" aria-label="Sort questions" className="flex gap-4">
      {tabs.map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={viewMode === mode}
          onClick={() => {
            onChange(mode);
          }}
          className={`text-sm transition ${
            viewMode === mode ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
