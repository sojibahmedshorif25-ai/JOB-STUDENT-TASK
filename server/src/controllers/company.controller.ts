import { Request, Response } from 'express';
import { Company } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { createUniqueSlug } from '../services/slug.service';
import { escapeRegex } from '../utils/helpers';

export const getCompanies = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
  const { search, industry } = req.query;

  const filter: Record<string, unknown> = {};
  if (search) {
    const safe = escapeRegex(String(search));
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { industry: { $regex: safe, $options: 'i' } },
    ];
  }
  if (industry && industry !== 'All') filter.industry = String(industry);

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .sort({ verified: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Company.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Companies fetched', companies, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await Company.findOne({ slug: req.params.slug });
  if (!company) throw new AppError('Company not found', 404);
  sendSuccess(res, 200, 'Company fetched', company);
});

export const getCompanyById = catchAsync(async (req: Request, res: Response) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new AppError('Company not found', 404);
  sendSuccess(res, 200, 'Company fetched', company);
});

export const getMyCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await Company.findOne({ owner: req.user!.id });
  sendSuccess(res, 200, 'Company fetched', company);
});

export const createCompany = catchAsync(async (req: Request, res: Response) => {
  if (req.user!.role !== 'RECRUITER' && req.user!.role !== 'ADMIN') {
    throw new AppError('Only recruiters can create companies', 403);
  }
  const existing = await Company.findOne({ owner: req.user!.id });
  if (existing) throw new AppError('You already have a company profile', 409);

  const slug = await createUniqueSlug(Company as never, req.body.name);
  const company = await Company.create({ ...req.body, slug, owner: req.user!.id });
  await (await import('../models')).User.findByIdAndUpdate(req.user!.id, { company: company._id });
  sendSuccess(res, 201, 'Company created', company);
});

export const updateCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new AppError('Company not found', 404);
  if (String(company.owner) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Permission denied', 403);
  }
  const updated = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, 200, 'Company updated', updated);
});
