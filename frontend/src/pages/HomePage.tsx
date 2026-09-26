import { ArrowRight, CircleQuestionMark, Plus, Shield, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AppHeader } from '../components/layout/AppHeader';
import { StatsBar } from '../components/layout/StatsBar';
import { WelcomeBanner } from '../components/layout/WelcomeBanner';
import { QuestionCard } from '../components/questions/QuestionCard';
import { SearchBar } from '../components/questions/SearchBar';
import { TopicFilter } from '../components/questions/TopicFilter';
import { ViewModeTabs } from '../components/questions/ViewModeTabs';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { QUESTION_TAGS } from '../constants';
import type { QuestionWithRelations, User } from '../types/models';
import {
  countAnswers,
  filterQuestions,
  hasReacted,
  sortQuestions,
  VIEW_MODE_TITLES,
  type ViewMode,
} from '../utils/questions';

const WELCOME_HIGHLIGHTS = [
  'Knowledge Encyclopedia',
  'Expert-Driven Content',
  'Growing Question Library',
];

interface HomePageProps {
  currentUser: User | null;
  questions: readonly QuestionWithRelations[];
  isLoadingQuestions: boolean;
  questionsError: Error | undefined;
  expertCount: number;
  unreadNotificationCount: number;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  onShowExperts: () => void;
  onAskQuestion: () => void;
  onOpenQuestion: (questionId: number) => void;
  onToggleUpvote: (question: QuestionWithRelations) => void;
  onToggleBookmark: (question: QuestionWithRelations) => void;
}

export function HomePage({
  currentUser,
  questions,
  isLoadingQuestions,
  questionsError,
  expertCount,
  unreadNotificationCount,
  onSignIn,
  onSignOut,
  onOpenAdmin,
  onOpenNotifications,
  onShowExperts,
  onAskQuestion,
  onOpenQuestion,
  onToggleUpvote,
  onToggleBookmark,
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('trending');

  const visibleQuestions = useMemo(
    () => sortQuestions(filterQuestions(questions, { searchQuery, tag: selectedTag }), viewMode),
    [questions, searchQuery, selectedTag, viewMode],
  );
  const unansweredCount = questions.filter((q) => q.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {!currentUser && (
          <WelcomeBanner
            title="Welcome to Playbook"
            subtitle="Build the ultimate knowledge base for sales and business leaders. Get expert insights from verified professionals."
            highlights={WELCOME_HIGHLIGHTS}
          />
        )}

        <AppHeader
          currentUser={currentUser}
          unreadNotificationCount={unreadNotificationCount}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          onOpenAdmin={onOpenAdmin}
          onOpenNotifications={onOpenNotifications}
        />

        <main>
          <section className="mb-16 text-center">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <TopicFilter tags={QUESTION_TAGS} selectedTag={selectedTag} onSelect={setSelectedTag} />

            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={onShowExperts}
                className="group flex items-center gap-3 rounded-full border-2 border-white/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-8 py-4 transition hover:border-white/40"
              >
                <Shield className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                <span className="font-semibold">Meet Our Expert Advisors</span>
                <ArrowRight
                  className="h-5 w-5 transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>

              {!currentUser && (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="flex items-center gap-3 rounded-full border-2 border-white/20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-8 py-4 transition hover:border-white/40"
                >
                  <Star className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  <span className="font-semibold">Contribute to Our Knowledge Base</span>
                </button>
              )}
            </div>
          </section>

          <section aria-labelledby="questions-heading">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 id="questions-heading" className="mb-2 text-3xl font-bold">
                  {VIEW_MODE_TITLES[viewMode]}
                </h2>
                <ViewModeTabs
                  viewMode={viewMode}
                  unansweredCount={unansweredCount}
                  onChange={setViewMode}
                />
              </div>
              <button
                type="button"
                onClick={onAskQuestion}
                className="flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-6 py-3 backdrop-blur-md transition hover:border-white/40 hover:bg-white/20"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Ask a New Question</span>
                <span className="sm:hidden">Ask</span>
              </button>
            </div>

            {isLoadingQuestions && <LoadingSpinner label="Loading questions..." />}

            {questionsError && (
              <ErrorMessage message="We couldn't load questions right now. Please refresh to try again." />
            )}

            {!isLoadingQuestions && !questionsError && visibleQuestions.length === 0 && (
              <div className="py-16 text-center">
                <CircleQuestionMark
                  className="mx-auto mb-4 h-16 w-16 text-white/30"
                  aria-hidden="true"
                />
                <h3 className="mb-2 text-xl font-semibold">No questions found</h3>
                <p className="mb-6 text-white/60">Be the first to ask about this topic!</p>
                <button
                  type="button"
                  onClick={onAskQuestion}
                  className="rounded-lg bg-blue-500/20 px-6 py-3 transition hover:bg-blue-500/30"
                >
                  Ask the First Question
                </button>
              </div>
            )}

            {visibleQuestions.length > 0 && (
              <>
                <div className="space-y-6">
                  {visibleQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isUpvoted={hasReacted(question.upvotes, currentUser?.id)}
                      isBookmarked={hasReacted(question.bookmarks, currentUser?.id)}
                      onOpen={() => {
                        onOpenQuestion(question.id);
                      }}
                      onToggleUpvote={() => {
                        onToggleUpvote(question);
                      }}
                      onToggleBookmark={() => {
                        onToggleBookmark(question);
                      }}
                    />
                  ))}
                </div>
                <StatsBar
                  questionCount={questions.length}
                  answerCount={countAnswers(questions)}
                  expertCount={expertCount}
                />
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
