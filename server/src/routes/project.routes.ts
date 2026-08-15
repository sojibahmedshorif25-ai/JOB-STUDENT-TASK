import { Router } from 'express';
import {
  getProjects,
  getProject,
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
  togglePublish,
  likeProject,
} from '../controllers/project.controller';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validators';

const router = Router();

router.get('/', getProjects);
router.get('/mine', protect, getMyProjects);
router.get('/:id', getProject);

router.post('/', protect, authorize('STUDENT', 'ADMIN'), validate(createProjectSchema), createProject);
router.put('/:id', protect, validate(updateProjectSchema), updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/publish', protect, togglePublish);
router.post('/:id/like', protect, likeProject);

export default router;
