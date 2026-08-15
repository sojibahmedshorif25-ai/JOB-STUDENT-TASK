import { Router } from 'express';
import { getMyResume, saveResume } from '../controllers/resume.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { saveResumeSchema } from '../validators/resume.validators';

const router = Router();

router.get('/', protect, getMyResume);
router.post('/', protect, validate(saveResumeSchema), saveResume);
router.put('/', protect, validate(saveResumeSchema), saveResume);

export default router;
