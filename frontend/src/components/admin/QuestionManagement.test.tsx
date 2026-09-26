import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeQuestion } from '../../test/fixtures';
import { QuestionManagement } from './QuestionManagement';

function renderList() {
  const onDeleteQuestion = vi.fn<(questionId: number) => Promise<void>>(() => Promise.resolve());
  render(
    <QuestionManagement
      questions={[makeQuestion({ id: 7, text: 'How do I coach new reps?' })]}
      statusFilter="ALL"
      onStatusFilterChange={vi.fn()}
      onOpenQuestion={vi.fn()}
      onDeleteQuestion={onDeleteQuestion}
    />,
  );
  return { onDeleteQuestion };
}

describe('QuestionManagement', () => {
  it('deletes a question after confirmation', async () => {
    const { onDeleteQuestion } = renderList();

    await userEvent.click(screen.getByRole('button', { name: /Delete question: How do I coach/ }));
    const dialog = screen.getByRole('dialog', { name: 'Delete this question?' });
    expect(within(dialog).getByText(/How do I coach new reps\?/)).toBeInTheDocument();
    expect(onDeleteQuestion).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete question' }));
    expect(onDeleteQuestion).toHaveBeenCalledWith(7);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the question when deletion is cancelled', async () => {
    const { onDeleteQuestion } = renderList();

    await userEvent.click(screen.getByRole('button', { name: /Delete question:/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDeleteQuestion).not.toHaveBeenCalled();
  });
});
