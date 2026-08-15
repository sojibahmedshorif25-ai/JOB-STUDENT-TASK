import { Router } from 'express';
import {
  enroll,
  getMyCourses,
  getEnrollmentForCourse,
  markLessonComplete,
  getMyCertificates,
  verifyCertificate,
} from '../controllers/enrollment.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

router.get('/', protect, getMyCourses);
router.get('/certificates', protect, getMyCertificates);
router.get('/certificates/verify/:id', verifyCertificate);
router.post('/:courseId', protect, enroll);
router.get('/:courseId', protect, getEnrollmentForCourse);
router.put(
  '/:courseId/progress',
  protect,
  validate(
    z.object({
      courseId: z.string().min(1),
      lessonId: z.string().min(1),
    }),
  ),
  markLessonComplete,
);

export default router;
