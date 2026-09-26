/** Normalizes an unknown thrown value into an `Error`. */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === 'string' ? value : 'An unexpected error occurred.');
}

export function getErrorMessage(value: unknown): string {
  return toError(value).message;
}
