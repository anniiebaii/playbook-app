import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeQuestion, makeReaction } from '../../test/fixtures';
import { QuestionCard } from './QuestionCard';

function renderCard(overrides: Partial<Parameters<typeof QuestionCard>[0]> = {}) {
  const props = {
    question: makeQuestion({ upvotes: [makeReaction(), makeReaction({ id: 2, userId: 'u2' })] }),
    isUpvoted: false,
    isBookmarked: false,
    onOpen: vi.fn(),
    onToggleUpvote: vi.fn(),
    onToggleBookmark: vi.fn(),
    ...overrides,
  };
  render(<QuestionCard {...props} />);
  return props;
}

describe('QuestionCard', () => {
  it('shows the question, author, and upvote count', () => {
    renderCard();
    expect(screen.getByText('How do I handle pricing objections?')).toBeInTheDocument();
    expect(screen.getByText(/Jordan Lee, Member/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upvote (2)' })).toHaveTextContent('2');
  });

  it('opens the question when the title is activated', async () => {
    const { onOpen } = renderCard();
    await userEvent.click(screen.getByRole('button', { name: /pricing objections/ }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('toggles an upvote without opening the question', async () => {
    const { onOpen, onToggleUpvote } = renderCard();
    await userEvent.click(screen.getByRole('button', { name: /Upvote/ }));
    expect(onToggleUpvote).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('reflects upvote and bookmark state for assistive tech', () => {
    renderCard({ isUpvoted: true, isBookmarked: true });
    expect(screen.getByRole('button', { name: /Upvote/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Remove bookmark' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
