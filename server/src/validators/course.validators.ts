import { z } from 'zod';

const quizQuestionSchema = z.object({
  question: z.string().min(3),
  options: z.array(z.object({ text: z.string().min(1) })).min(2),
  correctAnswer: z.string().min(1),
  explanation: z.string().optional().default(''),
});

const quizSchema = z.object({
  title: z.string().default('Quiz'),
  questions: z.array(quizQuestionSchema).default([]),
  passingScore: z.number().min(0).max(100).default(70),
  timeLimitMinutes: z.number().min(1).default(10),
});

const lessonSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['video', 'reading', 'quiz']).default('video'),
  duration: z.number().default(0),
  videoUrl: z.string().default(''),
  content: z.string().default(''),
  quiz: quizSchema.optional(),
  order: z.number().default(0),
});

const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  order: z.number().default(0),
  lessons: z.array(lessonSchema).default([]),
});

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(300),
  longDescription: z.string().max(10000).default(''),
  thumbnail: z.string().default(''),
  category: z.string().default('Development'),
  technology: z.array(z.string()).default([]),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  price: z.number().min(0).default(0),
  durationHours: z.number().min(0).default(0),
  whatYouWillLearn: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  modules: z.array(moduleSchema).default([]),
});

export const updateCourseSchema = createCourseSchema.partial();

export const submitQuizSchema = z.object({
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
  lessonId: z.string().min(1),
  answers: z.record(z.string()),
});
