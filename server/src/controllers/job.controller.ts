import { Request, Response } from 'express';
import { Job, Company, SavedJob, Application } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { createUniqueSlug } from '../services/slug.service';
import { escapeRegex } from '../utils/helpers';

const buildJobQuery = (query: Request['query']) => {
  const {
    search,
    jobType,
    experience,
    experienceLevel,
    salaryMin,
    remoteType,
    technology,
    location,
    company,
    sort,
    datePosted,
  } = query;

  const filter: Record<string, unknown> = { status: 'published' };

  if (search) {
    const safe = escapeRegex(String(search));
    filter.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { skills: { $regex: safe, $options: 'i' } },
      { location: { $regex: safe, $options: 'i' } },
    ];
  }
  if (jobType && jobType !== 'All') filter.jobType = String(jobType);
  if (remoteType && remoteType !== 'All') filter.remoteType = String(remoteType);
  if (location && location !== 'All') filter.location = { $regex: escapeRegex(String(location)), $options: 'i' };
  const exp = experience || experienceLevel;
  if (exp && exp !== 'All') filter.experienceLevel = String(exp);
  if (technology && technology !== 'All') filter.skills = { $regex: escapeRegex(String(technology)), $options: 'i' };
  if (company && company !== 'All') filter.company = String(company);
  if (salaryMin) filter.salaryMin = { $gte: Number(salaryMin) };
  if (datePosted) {
    const days = Number(datePosted);
    if (days > 0) filter.createdAt = { $gte: new Date(Date.now() - days * 86400000) };
  }
  if (query.deadlineOpen === 'true') filter.deadline = { $gte: new Date() };

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    salaryHigh: { salaryMax: -1 },
    relevant: { createdAt: -1 },
  };
  const sortQuery = sortOptions[String(sort || 'newest')] || sortOptions.newest;

  return { filter, sortQuery };
};

export const getJobs = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
  const { filter, sortQuery } = buildJobQuery(req.query);

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('company', 'name logo industry headquarters')
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Jobs fetched', jobs, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getJobById = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id).populate(
    'company',
    'name logo description website industry size headquarters verified',
  );
  if (!job || job.status === 'closed') throw new AppError('Job not found', 404);

  let saved = false;
  let applied = false;
  if (req.user) {
    saved = !!(await SavedJob.findOne({ student: req.user.id, job: job._id }));
    applied = !!(await Application.findOne({ student: req.user.id, job: job._id }));
  }

  const similar = await Job.find({
    status: 'published',
    _id: { $ne: job._id },
    $or: [{ skills: { $in: job.skills } }, { jobType: job.jobType }],
  })
    .populate('company', 'name logo industry')
    .limit(3)
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Job fetched', { ...job.toObject(), saved, applied, similar });
});

export const getJobBySlug = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findOne({ slug: req.params.slug }).populate('company');
  if (!job) throw new AppError('Job not found', 404);
  sendSuccess(res, 200, 'Job fetched', job);
});

export const getRecruiterJobs = catchAsync(async (req: Request, res: Response) => {
  const jobs = await Job.find({ recruiter: req.user!.id })
    .populate('company', 'name logo')
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Jobs fetched', jobs);
});

export const createJob = catchAsync(async (req: Request, res: Response) => {
  if (req.user!.role !== 'RECRUITER' && req.user!.role !== 'ADMIN') {
    throw new AppError('Only recruiters can create jobs', 403);
  }

  const company = await Company.findOne({ owner: req.user!.id });
  if (!company) {
    throw new AppError('Create a company profile before posting jobs', 400);
  }

  const slug = await createUniqueSlug(Job as never, req.body.title);
  const job = await Job.create({
    ...req.body,
    slug,
    recruiter: req.user!.id,
    company: company._id,
  });

  sendSuccess(res, 201, 'Job created', job);
});

export const updateJob = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found', 404);
  if (String(job.recruiter) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('You can only update your own jobs', 403);
  }

  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, 200, 'Job updated', updated);
});

export const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found', 404);
  if (String(job.recruiter) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('You can only delete your own jobs', 403);
  }
  await Job.findByIdAndDelete(req.params.id);
  await Application.deleteMany({ job: req.params.id });
  sendSuccess(res, 200, 'Job deleted');
});

export const toggleJobStatus = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found', 404);
  if (String(job.recruiter) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Permission denied', 403);
  }
  const status = job.status === 'published' ? 'closed' : 'published';
  const updated = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
  sendSuccess(res, 200, 'Job status updated', updated);
});

export const saveJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  const existing = await SavedJob.findOne({ student: req.user!.id, job: jobId });
  if (existing) {
    await SavedJob.deleteOne({ _id: existing._id });
    sendSuccess(res, 200, 'Job removed from saved', { saved: false });
    return;
  }
  await SavedJob.create({ student: req.user!.id, job: jobId });
  sendSuccess(res, 201, 'Job saved', { saved: true });
});

export const getSavedJobs = catchAsync(async (req: Request, res: Response) => {
  const saved = await SavedJob.find({ student: req.user!.id })
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name logo industry' },
    })
    .sort({ createdAt: -1 });
  const jobs = saved.map((s) => s.job).filter(Boolean);
  sendSuccess(res, 200, 'Saved jobs fetched', jobs);
});

export const getJobFilters = catchAsync(async (_req: Request, res: Response) => {
  const [locations, companies] = await Promise.all([
    Job.distinct('location', { status: 'published' }),
    Company.find({}, 'name logo').lean(),
  ]);
  sendSuccess(res, 200, 'Job filters fetched', {
    locations: locations.filter(Boolean),
    companies,
  });
});
