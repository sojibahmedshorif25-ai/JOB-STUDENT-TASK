import { z } from 'zod';

const personalSchema = z.object({
  fullName: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  location: z.string().max(200).optional(),
  website: z.string().max(300).optional(),
  linkedin: z.string().max(300).optional(),
  github: z.string().max(300).optional(),
  title: z.string().max(100).optional(),
  summary: z.string().max(2000).optional(),
});

export const sectionItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(300).optional(),
  date: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(3000).optional(),
  bullets: z.array(z.string().max(500)).optional(),
  name: z.string().max(100).optional(),
  level: z.string().max(50).optional(),
  items: z.array(z.string().max(100)).optional(),
});

export const sectionSchema = z.object({
  _id: z.string().optional(),
  id: z.string().optional(),
  type: z.string().min(1),
  title: z.string().max(200).optional(),
  order: z.number().default(0),
  items: z.array(sectionItemSchema).default([]),
});

export const saveResumeSchema = z.object({
  personal: personalSchema.optional(),
  sections: z.array(sectionSchema).default([]),
  template: z.string().default('modern'),
  primaryColor: z.string().default('#4f46e5'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
});
