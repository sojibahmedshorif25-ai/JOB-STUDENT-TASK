export const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const sanitizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';
