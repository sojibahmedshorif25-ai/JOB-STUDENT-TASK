import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPublicProfile,
  getStudents,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { updateProfileSchema } from '../validators/user.validators';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.get('/public/:id', getPublicProfile);
router.get('/students', protect, getStudents);

export default router;
