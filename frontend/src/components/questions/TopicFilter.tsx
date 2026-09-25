import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { FEATURED_TAG_COUNT } from '../../constants';

interface TopicFilterProps {
  tags: readonly string[];
  /** Empty string means "All Topics". */
  selectedTag: string;
  onSelect: (tag: string) => void;
}

const chipClass = (isActive: boolean) =>
  `rounded-full border-2 px-6 py-3 transition ${
    isActive ? 'border-white/40 bg-white/20' : 'border-white/20 bg-white/10 hover:bg-white/15'
  }`;

/** Single-select topic chips. Shows a few featured topics until expanded. */
export function TopicFilter({ tags, selectedTag, onSelect }: TopicFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleTags = isExpanded ? tags : tags.slice(0, FEATURED_TAG_COUNT);
  const hasHiddenTags = tags.length > FEATURED_TAG_COUNT;

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-4">
      {[{ tag: '', label: 'All Topics' }, ...visibleTags.map((tag) => ({ tag, label: tag }))].map(
        ({ tag, label }) => (
          <button
            key={label}
            type="button"
            aria-pressed={selectedTag === tag}
            onClick={() => {
              onSelect(tag);
            }}
            className={chipClass(selectedTag === tag)}
          >
            {label}
          </button>
        ),
      )}
      {hasHiddenTags && (
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => {
            setIsExpanded((expanded) => !expanded);
          }}
          className={`${chipClass(false)} flex items-center gap-2`}
        >
          {isExpanded ? 'Less' : 'More'}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
