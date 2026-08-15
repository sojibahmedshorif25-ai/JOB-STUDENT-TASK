import { z } from 'zod';

export const interviewScheduleSchema = z.object({
  applicationId: z.string().min(1),
  type: z.enum(['Technical', 'Behavioral', 'HR', 'System Design', 'Mock']).default('Technical'),
  scheduledAt: z.string().datetime('Invalid date'),
  durationMinutes: z.number().min(15).max(240).default(60),
  meetingLink: z.string().default(''),
  notes: z.string().max(2000).default(''),
});

export const interviewProgressSchema = z.object({
  category: z.string().min(1),
  questionId: z.string().optional(),
  answer: z.string().max(5000).optional(),
  rating: z.number().min(0).max(5).optional(),
  timeTakenSeconds: z.number().min(0).default(0),
});
