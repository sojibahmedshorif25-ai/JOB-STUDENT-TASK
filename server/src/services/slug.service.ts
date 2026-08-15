import { slugify } from '../utils/slugify';

export const createUniqueSlug = async (
  model: { findOne: (query: Record<string, unknown>) => Promise<{ _id: unknown } | null> },
  text: string,
): Promise<string> => {
  const base = slugify(text) || 'item';
  let slug = base;
  let counter = 1;
  while (await model.findOne({ slug })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
};
