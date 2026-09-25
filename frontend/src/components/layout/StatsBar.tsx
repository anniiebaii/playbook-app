interface StatsBarProps {
  questionCount: number;
  answerCount: number;
  expertCount: number;
}

export function StatsBar({ questionCount, answerCount, expertCount }: StatsBarProps) {
  const stats = [
    { label: 'Total Questions', value: questionCount, color: 'text-blue-400' },
    { label: 'Expert Answers', value: answerCount, color: 'text-green-400' },
    { label: 'Expert Advisors', value: expertCount, color: 'text-purple-400' },
  ];

  return (
    <dl className="mt-12 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center sm:grid-cols-3">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="flex flex-col-reverse">
          <dt className="text-white/60">{label}</dt>
          <dd className={`text-3xl font-bold ${color}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
