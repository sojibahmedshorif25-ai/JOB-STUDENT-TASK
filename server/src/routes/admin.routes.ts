import { Router } from 'express';
import {
  getDashboard,
  getUserGrowth,
  getUsers,
  updateUserStatus,
  getRecruiters,
  getAdminCompanies,
  verifyCompany,
  getAdminCourses,
  getAdminJobs,
  getAdminApplications,
  getAdminProjects,
  getCertificates,
  getReports,
  dashboardHealth,
  syncAdminCredentials,
} from '../controllers/admin.controller';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

router.use(protect, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getUserGrowth);
router.get('/users', getUsers);
router.put('/users/:id/status', validate(z.object({ isActive: z.boolean() })), updateUserStatus);
router.get('/recruiters', getRecruiters);
router.get('/companies', getAdminCompanies);
router.put('/companies/:id/verify', validate(z.object({ verified: z.boolean() })), verifyCompany);
router.get('/courses', getAdminCourses);
router.get('/jobs', getAdminJobs);
router.get('/applications', getAdminApplications);
router.get('/projects', getAdminProjects);
router.get('/certificates', getCertificates);
router.get('/reports', getReports);
router.get('/health', dashboardHealth);
router.post(
  '/sync-admin',
  validate(z.object({ email: z.string().email(), password: z.string().min(8) })),
  syncAdminCredentials,
);

export default router;
