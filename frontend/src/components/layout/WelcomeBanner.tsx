import { CircleCheckBig } from 'lucide-react';

interface WelcomeBannerProps {
  title: string;
  subtitle: string;
  highlights: readonly string[];
}

export function WelcomeBanner({ title, subtitle, highlights }: WelcomeBannerProps) {
  return (
    <div className="mb-12 rounded-2xl border border-white/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 text-center">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <p className="mx-auto mb-6 max-w-2xl text-lg text-white/80">{subtitle}</p>
      <ul className="flex flex-wrap justify-center gap-4">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex items-center gap-2 text-white/80">
            <CircleCheckBig className="h-5 w-5 text-green-400" aria-hidden="true" />
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}
