export function TagList({ tags }: { tags: readonly string[] | null }) {
  if (!tags?.length) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-white/10 px-3 py-1 text-sm">
          {tag}
        </li>
      ))}
    </ul>
  );
}
