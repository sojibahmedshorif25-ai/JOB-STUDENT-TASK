import { Router } from 'express';
import {
  applyToJob,
  getMyApplications,
  getApplication,
  getJobApplications,
  getRecruiterApplications,
  updateApplicationStatus,
} from '../controllers/application.controller';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from '../validators/application.validators';

const router = Router();

router.get('/my', protect, getMyApplications);
router.get('/recruiter', protect, authorize('RECRUITER', 'ADMIN'), getRecruiterApplications);
router.get('/job/:jobId', protect, authorize('RECRUITER', 'ADMIN'), getJobApplications);
router.get('/:id', protect, getApplication);

router.post('/job/:id', protect, authorize('STUDENT'), validate(createApplicationSchema), applyToJob);
router.put('/:id/status', protect, authorize('RECRUITER', 'ADMIN'), validate(updateApplicationStatusSchema), updateApplicationStatus);

export default router;
