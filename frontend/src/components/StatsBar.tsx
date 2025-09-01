interface StatsProps {
    questionsCount: number;
    answersCount: number,
    expertsCount: number
}

const StatsBar: React.FC<StatsProps> = ({
    questionsCount,
    answersCount,
    expertsCount
}) => {

    return (
        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                    <div className="text-3xl font-bold text-blue-400">{questionsCount}</div>
                    <div className="text-white/60">Total Questions</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-green-400">
                        {answersCount}
                    </div>
                    <div className="text-white/60">Expert Answers</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-purple-400">{expertsCount}</div>
                    <div className="text-white/60">Expert Advisors</div>
                </div>
            </div>
        </div>

    )
}

export default StatsBar;