import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../test/fixtures';
import type { User } from '../../types/models';
import { UserManagement } from './UserManagement';

const active = makeUser({ id: 'u1', name: 'Jordan Lee' });
const inactive = makeUser({ id: 'u2', name: 'Casey Kim', status: 'INACTIVE' });

function renderTable(members: User[] = [active, inactive]) {
  const onSetStatus = vi.fn(() => Promise.resolve());
  const onDelete = vi.fn(() => Promise.resolve());
  render(
    <UserManagement
      members={members}
      isLoading={false}
      error={undefined}
      onSetStatus={onSetStatus}
      onDelete={onDelete}
    />,
  );
  return { onSetStatus, onDelete };
}

describe('UserManagement', () => {
  it('deactivates active members and reactivates inactive ones', async () => {
    const { onSetStatus } = renderTable();

    await userEvent.click(screen.getByRole('button', { name: 'Deactivate Jordan Lee' }));
    expect(onSetStatus).toHaveBeenCalledWith(active, 'INACTIVE');

    await userEvent.click(screen.getByRole('button', { name: 'Reactivate Casey Kim' }));
    expect(onSetStatus).toHaveBeenCalledWith(inactive, 'ACTIVE');
  });

  it('shows why a status change failed', async () => {
    const { onSetStatus } = renderTable([active]);
    onSetStatus.mockRejectedValueOnce(new Error('Only experts can change account status.'));

    await userEvent.click(screen.getByRole('button', { name: 'Deactivate Jordan Lee' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Only experts');
  });

  it('asks for confirmation before deleting', async () => {
    const { onDelete } = renderTable([active]);

    await userEvent.click(screen.getByRole('button', { name: 'Delete Jordan Lee' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete Jordan Lee?' });
    expect(onDelete).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete permanently' }));
    expect(onDelete).toHaveBeenCalledWith(active);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does nothing when deletion is cancelled', async () => {
    const { onDelete } = renderTable([active]);

    await userEvent.click(screen.getByRole('button', { name: 'Delete Jordan Lee' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the dialog open with the error if deletion fails', async () => {
    const { onDelete } = renderTable([active]);
    onDelete.mockRejectedValueOnce(new Error('User not found.'));

    await userEvent.click(screen.getByRole('button', { name: 'Delete Jordan Lee' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
    const dialog = screen.getByRole('dialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('User not found.');
  });
});
