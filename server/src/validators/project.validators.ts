import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  features: z.array(z.string()).default([]),
  techStack: z.array(z.string().trim().min(1)).min(1),
  thumbnail: z.string().default(''),
  screenshots: z.array(z.string()).default([]),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')),
  course: z.string().optional(),
  published: z.boolean().default(false),
});

export const updateProjectSchema = createProjectSchema.partial();
