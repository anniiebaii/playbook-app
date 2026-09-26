import { describe, expect, it } from 'vitest';

import { ACCOUNT_DEACTIVATED_MESSAGE, getAuthErrorMessage } from './auth';

describe('getAuthErrorMessage', () => {
  it('tells banned (deactivated) users their account is deactivated', () => {
    expect(getAuthErrorMessage({ code: 'user_banned', message: 'User is banned' })).toBe(
      ACCOUNT_DEACTIVATED_MESSAGE,
    );
  });

  it('maps known codes to friendly messages', () => {
    expect(getAuthErrorMessage({ code: 'invalid_credentials', message: 'raw' })).toBe(
      'Invalid email or password.',
    );
  });

  it('falls back to the original message for unknown codes', () => {
    expect(getAuthErrorMessage({ code: 'over_request_rate_limit', message: 'Slow down' })).toBe(
      'Slow down',
    );
    expect(getAuthErrorMessage({ code: undefined, message: 'Network error' })).toBe(
      'Network error',
    );
  });
});
