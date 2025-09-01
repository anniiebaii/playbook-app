import { User, Question, QuestionWithRelations } from "lib/supabase";
import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

interface AskExpertProps {
    questions: QuestionWithRelations[];
    selectedExpert: User | null;
    showAskExpert: boolean;
    tags: string[];
    currentUser: User | null;
    setQuestions: (questions: QuestionWithRelations[]) => void;
    setSelectedExpert: (expert: User | null) => void;
    setShowAskExpert: (show: boolean) => void;
}
  
const AskExpertModal: React.FC<AskExpertProps> = ({
    selectedExpert,
    tags,
    showAskExpert,
    questions,
    currentUser,
    setQuestions,
    setSelectedExpert,
    setShowAskExpert

}) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  if (!showAskExpert || !selectedExpert) return null;
  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl max-w-2xl w-full border border-white/20">
          <h2 className="text-2xl font-bold mb-2">Ask {selectedExpert.name}</h2>
          <p className="text-white/70 mb-6">
            {selectedExpert.title} • Responds in {selectedExpert.responseTime || '< 24 hours'}
          </p>
          
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={`What would you like to ask ${selectedExpert.name}?`}
            className="w-full p-4 mb-6 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 min-h-[120px]"
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
                  const now = new Date();
                  const newQuestion = {
                    id: questions.length + 1,
                    text: questionText,
                    authorId: currentUser?.id || "0",
                    author: currentUser!,
                    role: "Member",
                    tags: selectedTags,
                    upvotes: [],
                    bookmarks: [],
                    status: "PENDING" as const,
                    priority: "MEDIUM" as const,
                    views: 0,
                    assignedTo: selectedExpert,
                    answers: [],
                    createdAt: now,
                    updatedAt: now
                  };
                  
                  setQuestions([newQuestion, ...questions]);
                  setShowAskExpert(false);
                  setSelectedExpert(null);
                  alert(`Your question has been sent to ${selectedExpert.name}!`);
                }
              }}
              disabled={!questionText || selectedTags.length === 0}
              className="flex-1 py-3 bg-blue-500/20 rounded-lg font-semibold hover:bg-blue-500/30 transition disabled:opacity-50 text-blue-300"
            >
              Send Question
            </button>
            <button 
              onClick={() => {
                setShowAskExpert(false);
                setSelectedExpert(null);
              }} 
              className="flex-1 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default AskExpertModal;