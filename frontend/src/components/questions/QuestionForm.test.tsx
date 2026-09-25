import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { QuestionForm } from './QuestionForm';

function renderForm(onSubmit = vi.fn(() => Promise.resolve())) {
  render(
    <QuestionForm
      tags={['Sales', 'Leadership']}
      titlePlaceholder="What's your question?"
      submitLabel="Post Question"
      onSubmit={onSubmit}
      onCancel={vi.fn()}
    />,
  );
  return { onSubmit, submit: screen.getByRole('button', { name: 'Post Question' }) };
}

describe('QuestionForm', () => {
  it('requires a title and at least one tag', async () => {
    const { submit } = renderForm();
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Question'), 'How do I coach new reps?');
    expect(submit).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Leadership' }));
    expect(submit).toBeEnabled();
  });

  it('submits a trimmed draft with the selected tags', async () => {
    const { onSubmit, submit } = renderForm();
    await userEvent.type(screen.getByLabelText('Question'), '  How do I coach new reps?  ');
    await userEvent.type(screen.getByLabelText('Details'), 'Team of five.');
    await userEvent.click(screen.getByRole('button', { name: 'Sales' }));
    await userEvent.click(submit);

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'How do I coach new reps?',
      description: 'Team of five.',
      tags: ['Sales'],
    });
  });

  it('shows the error when submission fails', async () => {
    const { submit } = renderForm(vi.fn(() => Promise.reject(new Error('Network down'))));
    await userEvent.type(screen.getByLabelText('Question'), 'Question?');
    await userEvent.click(screen.getByRole('button', { name: 'Sales' }));
    await userEvent.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent('Network down');
    expect(submit).toBeEnabled();
  });
});
