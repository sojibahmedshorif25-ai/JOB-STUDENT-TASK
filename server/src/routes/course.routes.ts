import { Router } from 'express';
import {
  getCourses,
  getCourseBySlug,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCategories,
  getCourseReviews,
  createCourseReview,
  submitQuiz,
} from '../controllers/course.controller';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createCourseSchema, updateCourseSchema, submitQuizSchema } from '../validators/course.validators';
import { z } from 'zod';

const router = Router();

router.get('/', getCourses);
router.get('/filters', getCategories);
router.get('/slug/:slug', getCourseBySlug);
router.get('/:id', getCourseById);
router.get('/:id/reviews', getCourseReviews);

router.post('/', protect, authorize('ADMIN'), validate(createCourseSchema), createCourse);
router.put('/:id', protect, authorize('ADMIN'), validate(updateCourseSchema), updateCourse);
router.delete('/:id', protect, authorize('ADMIN'), deleteCourse);

router.post(
  '/:id/reviews',
  protect,
  validate(z.object({ rating: z.number().min(1).max(5), title: z.string().optional(), comment: z.string().optional() })),
  createCourseReview,
);
router.post('/quiz/submit', protect, validate(submitQuizSchema), submitQuiz);

export default router;
