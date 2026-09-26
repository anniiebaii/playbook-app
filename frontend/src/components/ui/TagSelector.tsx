interface TagSelectorProps {
  tags: readonly string[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
}

/** Multi-select list of toggleable tag chips. */
export function TagSelector({ tags, selected, onChange }: TagSelectorProps) {
  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isSelected}
            onClick={() => {
              toggle(tag);
            }}
            className={`rounded-full border px-4 py-2 transition ${
              isSelected
                ? 'border-white/40 bg-white/20'
                : 'border-white/20 bg-white/10 hover:bg-white/15'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
