import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative mx-auto mb-8 max-w-2xl">
      <Search
        className="pointer-events-none absolute left-6 top-1/2 z-10 h-6 w-6 -translate-y-1/2 transform text-white/60"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder="Search our knowledge base..."
        aria-label="Search questions"
        className="w-full rounded-full border-2 border-white/20 bg-white/10 py-6 pl-16 pr-6 text-xl placeholder-white/60 outline-none backdrop-blur-md transition focus:border-white/40 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
          }}
          aria-label="Clear search"
          className="absolute right-6 top-1/2 -translate-y-1/2 transform text-white/60 transition hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
