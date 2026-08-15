import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(10000),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  skills: z.array(z.string().trim().min(1)).min(1, 'At least one skill is required'),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().default('$'),
  location: z.string().min(1).max(200),
  jobType: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract']).default('Full-time'),
  experienceLevel: z.string().default('Entry'),
  remoteType: z.enum(['Remote', 'Hybrid', 'On-site']).default('On-site'),
  benefits: z.array(z.string()).default([]),
  deadline: z.string().datetime().optional().or(z.date().optional()),
  status: z.enum(['published', 'draft', 'closed']).default('published'),
});

export const updateJobSchema = createJobSchema.partial();
