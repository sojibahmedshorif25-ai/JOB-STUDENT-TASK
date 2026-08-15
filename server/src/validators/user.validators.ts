import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  skills: z.array(z.string().trim().max(50)).max(30).optional(),
  avatar: z.string().optional(),
});
