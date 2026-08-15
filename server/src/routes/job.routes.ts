import { Router } from 'express';
import {
  getJobs,
  getJobById,
  getJobBySlug,
  getRecruiterJobs,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  saveJob,
  getSavedJobs,
  getJobFilters,
} from '../controllers/job.controller';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createJobSchema, updateJobSchema } from '../validators/job.validators';

const router = Router();

router.get('/', getJobs);
router.get('/filters', getJobFilters);
router.get('/saved', protect, getSavedJobs);
router.get('/recruiter', protect, authorize('RECRUITER', 'ADMIN'), getRecruiterJobs);
router.get('/slug/:slug', getJobBySlug);
router.get('/:id', getJobById);

router.post('/', protect, authorize('RECRUITER', 'ADMIN'), validate(createJobSchema), createJob);
router.put('/:id', protect, authorize('RECRUITER', 'ADMIN'), validate(updateJobSchema), updateJob);
router.delete('/:id', protect, authorize('RECRUITER', 'ADMIN'), deleteJob);
router.post('/:id/toggle', protect, authorize('RECRUITER', 'ADMIN'), toggleJobStatus);
router.post('/:id/save', protect, authorize('STUDENT'), saveJob);

export default router;
