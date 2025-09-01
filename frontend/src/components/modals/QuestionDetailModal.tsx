import { QuestionWithRelations, User, Answer } from '../../lib/supabase';
import React, { useState } from 'react';
import { User as LucideUser, Shield, X } from 'lucide-react';

interface QuestionDetailsProp {
    currentUser: User | null
    selectedQuestion: QuestionWithRelations | null
    questions: QuestionWithRelations[]
    setSelectedQuestion: (question: QuestionWithRelations | null) => void;
    handleAddAnswer: (content: string, type: Answer["type"]) => void;
}

const QuestionDetailModal: React.FC<QuestionDetailsProp> = ({
    selectedQuestion,
    questions,
    setSelectedQuestion,
    currentUser,
    handleAddAnswer
}) => {
    // Define our React Hook for managing the answer text state
    const [answerText, setAnswerText] = useState("");

    if (!selectedQuestion) return null;

    const question = questions.find(q => q.id === selectedQuestion.id) || selectedQuestion;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* max-h-[90vh]: keep the modal from being taller than 90% of the viewport height. */}
        { /* overflow-y-auto: make the modal scroll internally when content overflows. */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold pr-4">{question.text}</h2>
            <button onClick={() => setSelectedQuestion(null)} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {question.description && (
            <p className="text-white/80 mb-6">{question.description}</p>
          )}

          <div className="flex items-center gap-4 mb-6 text-white/80">
            <span>{question.author.name}, {question.role}</span>
            <span>•</span>
            <span>{question.createdAt.toLocaleDateString()}</span>
          </div>

          <div className="flex gap-2 mb-8">
            {(question.tags ?? []).map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="border-t border-white/20 pt-6">
            <h3 className="text-xl font-semibold mb-4">Answers ({question.answers?.length ?? 0})</h3>

            {(question.answers ?? []).map(answer => (
              <div key={answer.id} className="mb-6 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {answer.isAdmin && <Shield className="w-4 h-4 text-yellow-400" />}
                  <span className="font-semibold">{answer.author.name}</span>
                  <span className="text-sm text-white/60">{answer.createdAt.toLocaleDateString()}</span>
                </div>
                <p className="text-white/90">{answer.content}</p>
              </div>
            ))}

            {currentUser?.isAdmin && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  Add Admin Answer
                </h4>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 min-h-[100px]"
                />
                <button
                  onClick={() => {
                    handleAddAnswer(answerText, "TEXT");
                    setAnswerText(""); // clear after posting
                  }}
                  disabled={!answerText}
                  className="w-full py-3 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition disabled:opacity-50"
                >
                  Post Answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default QuestionDetailModal;