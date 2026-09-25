import type { LucideIcon } from 'lucide-react';

const THEMES = {
  blue: { card: 'from-blue-500/20 to-blue-600/20 border-blue-500/20', accent: 'text-blue-400' },
  orange: {
    card: 'from-orange-500/20 to-orange-600/20 border-orange-500/20',
    accent: 'text-orange-400',
  },
  green: {
    card: 'from-green-500/20 to-green-600/20 border-green-500/20',
    accent: 'text-green-400',
  },
  purple: {
    card: 'from-purple-500/20 to-purple-600/20 border-purple-500/20',
    accent: 'text-purple-400',
  },
} as const;

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  theme: keyof typeof THEMES;
  /** When provided, the card is a button with this call to action. */
  action?: { label: string; onClick: () => void };
}

export function StatCard({ icon: Icon, value, label, theme, action }: StatCardProps) {
  const { card, accent } = THEMES[theme];
  const content = (
    <>
      <Icon className={`mb-4 h-8 w-8 ${accent}`} aria-hidden="true" />
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-white/60">{label}</p>
      {action && <p className={`mt-2 text-sm ${accent}`}>{action.label} →</p>}
    </>
  );
  const className = `rounded-xl border bg-gradient-to-br p-6 text-left backdrop-blur-xl ${card}`;

  return action ? (
    <button
      type="button"
      onClick={action.onClick}
      className={`${className} transition-transform hover:scale-105`}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}
