import { Router } from 'express';
import {
  getCompanies,
  getCompany,
  getCompanyById,
  getMyCompany,
  createCompany,
  updateCompany,
} from '../controllers/company.controller';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(2).max(200),
  logo: z.string().default(''),
  description: z.string().max(3000).default(''),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().default(''),
  size: z.string().default(''),
  headquarters: z.string().default(''),
  foundedYear: z.number().min(1800).max(2100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  socialLinks: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
    })
    .optional(),
});

const router = Router();

router.get('/', getCompanies);
router.get('/mine', protect, getMyCompany);
router.get('/id/:id', getCompanyById);
router.get('/slug/:slug', getCompany);

router.post('/', protect, authorize('RECRUITER', 'ADMIN'), validate(companySchema), createCompany);
router.put('/:id', protect, validate(companySchema.partial()), updateCompany);

export default router;
