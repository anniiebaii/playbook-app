import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { QuestionData } from '../lib/supabase';
import { User } from '../lib/supabase';

interface AskQuestionProps {
    currentUser: User | null;
    handleAskQuestion: (questionData: QuestionData) => void;
    setShowAskQuestion: (show: boolean) => void;
    tags: string[];
    showAskQuestion: boolean;
}

const AskQuestionModal: React.FC<AskQuestionProps> = ({
    currentUser,
    tags,
    showAskQuestion,
    setShowAskQuestion,
    handleAskQuestion
}) => {
    const [questionText, setQuestionText] = useState('');
    const [questionDescription, setQuestionDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    if (!showAskQuestion) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl max-w-2xl w-full border border-white/20">
            <h2 className="text-2xl font-bold mb-6">Ask a Question</h2>
            <input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="What's your question?"
              className="w-full p-4 mb-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
            />
            <textarea
              value={questionDescription}
              onChange={(e) => setQuestionDescription(e.target.value)}
              placeholder="Provide more details (optional)"
              className="w-full p-4 mb-6 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 min-h-[80px]"
            />
            <div className="mb-6">
              <p className="text-sm mb-3 text-white/80">Select relevant tags:</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(selectedTags.includes(tag) 
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag]
                      );
                    }}
                    className={`px-4 py-2 rounded-full border transition ${
                      selectedTags.includes(tag)
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (questionText && selectedTags.length > 0) {
                    handleAskQuestion({ authorId: currentUser?.id || "0", title: questionText, description: questionDescription, tags: selectedTags });
                  }
                }}
                disabled={!questionText || selectedTags.length === 0}
                className="flex-1 py-3 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition disabled:opacity-50"
              >
                Post Question
              </button>
              <button onClick={() => setShowAskQuestion(false)} className="flex-1 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
  };

  export default AskQuestionModal;