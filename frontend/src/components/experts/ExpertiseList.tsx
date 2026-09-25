export function ExpertiseList({ expertise }: { expertise: readonly string[] | null }) {
  if (!expertise?.length) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-white/60">Areas of Expertise:</p>
      <ul className="flex flex-wrap gap-2">
        {expertise.map((area) => (
          <li key={area} className="rounded-full bg-white/10 px-3 py-1 text-sm">
            {area}
          </li>
        ))}
      </ul>
    </div>
  );
}
