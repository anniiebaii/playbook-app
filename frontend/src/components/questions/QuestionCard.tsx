import { Bookmark, CircleCheckBig, Eye, ThumbsUp, User as UserIcon } from 'lucide-react';

import type { QuestionWithRelations } from '../../types/models';
import { formatRelativeTime, pluralize } from '../../utils/format';
import { isHotQuestion } from '../../utils/questions';
import { TagList } from './TagList';

interface QuestionCardProps {
  question: QuestionWithRelations;
  isUpvoted: boolean;
  isBookmarked: boolean;
  onOpen: () => void;
  onToggleUpvote: () => void;
  onToggleBookmark: () => void;
}

export function QuestionCard({
  question,
  isUpvoted,
  isBookmarked,
  onOpen,
  onToggleUpvote,
  onToggleBookmark,
}: QuestionCardProps) {
  const answerCount = question.answers.length;

  return (
    // The whole card is clickable for pointer users; the title button provides keyboard
    // access, and its click bubbles up to the card's handler.
    <article
      onClick={onOpen}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:bg-white/10"
    >
      {isHotQuestion(question) && (
        <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-semibold">
          HOT
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-3 text-2xl font-semibold transition group-hover:text-white/90">
            <button type="button" className="text-left">
              {question.text}
            </button>
          </h3>

          {question.description && (
            <p className="mb-3 line-clamp-2 text-white/60">{question.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70">
            <span className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" aria-hidden="true" />
              {question.author.name}, {question.role}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              •
            </span>
            <time dateTime={question.createdAt}>{formatRelativeTime(question.createdAt)}</time>
            <span aria-hidden="true" className="hidden sm:inline">
              •
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" aria-hidden="true" />
              {pluralize(question.views, 'view')}
            </span>
            {question.status === 'ANSWERED' && (
              <>
                <span aria-hidden="true" className="hidden sm:inline">
                  •
                </span>
                <span className="flex items-center gap-1 text-green-400">
                  <CircleCheckBig className="h-4 w-4" aria-hidden="true" />
                  Answered
                </span>
              </>
            )}
          </div>

          <div className="mt-4">
            <TagList tags={question.tags} />
          </div>
        </div>

        <div className="ml-4 flex flex-col gap-3">
          <button
            type="button"
            aria-pressed={isUpvoted}
            aria-label={`Upvote (${String(question.upvotes.length)})`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleUpvote();
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300 ${
              isUpvoted
                ? 'scale-105 border border-blue-400/50 bg-blue-500/30 text-blue-300'
                : 'border border-white/10 bg-white/10 hover:bg-white/15'
            }`}
          >
            <ThumbsUp
              className={`h-4 w-4 transition-transform duration-300 ${
                isUpvoted ? 'scale-110 fill-current' : 'hover:scale-110'
              }`}
              aria-hidden="true"
            />
            <span className="font-medium">{question.upvotes.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            title={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(event) => {
              event.stopPropagation();
              onToggleBookmark();
            }}
            className={`rounded-lg p-2 transition-all duration-300 ${
              isBookmarked
                ? 'scale-105 border border-yellow-400/50 bg-yellow-500/30 text-yellow-300'
                : 'border border-white/10 bg-white/10 hover:bg-white/15'
            }`}
          >
            <Bookmark
              className={`h-4 w-4 transition-transform duration-300 ${
                isBookmarked ? 'scale-110 fill-current' : 'hover:scale-110'
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {answerCount > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/60">
          <p>{pluralize(answerCount, 'answer')}</p>
          <p>Click to view answers →</p>
        </div>
      )}
    </article>
  );
}
