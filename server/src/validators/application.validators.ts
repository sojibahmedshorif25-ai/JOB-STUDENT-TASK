import { z } from 'zod';

export const createApplicationSchema = z.object({
  resumeId: z.string().optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
  coverLetter: z.string().max(5000).optional(),
  expectedSalary: z.number().min(0).optional(),
  availability: z.string().max(200).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected']),
  note: z.string().max(500).optional(),
});
