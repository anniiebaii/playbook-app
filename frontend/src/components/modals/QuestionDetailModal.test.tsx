import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeQuestion } from '../../test/fixtures';
import { QuestionDetailModal } from './QuestionDetailModal';

function renderModal(canDelete: boolean, onDelete = vi.fn(() => Promise.resolve())) {
  render(
    <QuestionDetailModal
      question={makeQuestion()}
      canAnswer={canDelete}
      canDelete={canDelete}
      onClose={vi.fn()}
      onSubmitAnswer={vi.fn(() => Promise.resolve())}
      onDelete={onDelete}
    />,
  );
  return { onDelete };
}

describe('QuestionDetailModal deletion', () => {
  it('is not offered to non-experts', () => {
    renderModal(false);
    expect(screen.queryByRole('button', { name: 'Delete question' })).not.toBeInTheDocument();
  });

  it('asks for inline confirmation before deleting', async () => {
    const { onDelete } = renderModal(true);

    await userEvent.click(screen.getByRole('button', { name: 'Delete question' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Confirm deletion' })).toHaveTextContent(
      'permanently deletes',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('shows the error and allows a retry if deletion fails', async () => {
    const onDelete = vi.fn(() => Promise.reject(new Error("This question couldn't be deleted.")));
    renderModal(true, onDelete);

    await userEvent.click(screen.getByRole('button', { name: 'Delete question' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("couldn't be deleted");
    expect(screen.getByRole('button', { name: 'Delete permanently' })).toBeEnabled();
  });
});
