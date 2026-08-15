import { Request, Response } from 'express';
import { Application, Job, Notification, Resume } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { createNotification } from '../services/notification.service';

export const applyToJob = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.id;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);
  if (job.status !== 'published') throw new AppError('This job is no longer accepting applications', 400);

  const existing = await Application.findOne({ student: req.user!.id, job: jobId });
  if (existing) throw new AppError('You have already applied for this job', 409);

  let resumeId: string | undefined;
  let resumeUrl = req.body.resumeUrl || '';
  if (req.body.resumeId) {
    const resume = await Resume.findOne({ user: req.user!.id, _id: req.body.resumeId });
    if (resume) {
      resumeId = String(resume._id);
      resumeUrl = resume.personal?.github || resumeUrl;
    }
  }

  const application = await Application.create({
    job: jobId,
    student: req.user!.id,
    resume: resumeId,
    resumeUrl,
    coverLetter: req.body.coverLetter || '',
    expectedSalary: req.body.expectedSalary,
    availability: req.body.availability || '',
    status: 'Applied',
    statusHistory: [{ status: 'Applied', note: 'Application submitted', changedAt: new Date() }],
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  await createNotification({
    userId: req.user!.id,
    type: 'Application',
    title: `Application submitted for ${job.title}`,
    message: 'Your application is now under review.',
    link: '/dashboard/applications',
  });

  if (job.recruiter) {
    await createNotification({
      userId: String(job.recruiter),
      type: 'Application',
      title: 'New application received',
      message: `A candidate applied for ${job.title}.`,
      link: `/recruiter/applicants`,
      data: { applicationId: String(application._id) },
    });
  }

  sendSuccess(res, 201, 'Application submitted successfully', application);
});

export const getMyApplications = catchAsync(async (req: Request, res: Response) => {
  const applications = await Application.find({ student: req.user!.id })
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name logo' },
    })
    .populate('interview')
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Applications fetched', applications);
});

export const getApplication = catchAsync(async (req: Request, res: Response) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name logo industry location' },
    })
    .populate('student', 'name email avatar headline skills resume')
    .populate('interview');

  if (!application) throw new AppError('Application not found', 404);

  const isOwner =
    String(application.student?._id || application.student) === req.user!.id;
  const isRecruiter =
    String(
      (application.job as unknown as { recruiter?: { toString: () => string } } | null)?.recruiter || '',
    ) === req.user!.id || req.user!.role === 'ADMIN';
  if (!isOwner && !isRecruiter) throw new AppError('Permission denied', 403);

  sendSuccess(res, 200, 'Application fetched', application);
});

export const getJobApplications = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);
  if (String(job.recruiter) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Permission denied', 403);
  }

  const applications = await Application.find({ job: jobId })
    .populate('student', 'name email avatar headline location skills')
    .populate('interview')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Applications fetched', applications);
});

export const getRecruiterApplications = catchAsync(async (req: Request, res: Response) => {
  const jobs = await Job.find({ recruiter: req.user!.id }).select('_id');
  const jobIds = jobs.map((j) => j._id);

  const { status, search } = req.query;
  const filter: Record<string, unknown> = { job: { $in: jobIds } };
  if (status && status !== 'All') filter.status = String(status);
  if (search) filter._id = String(search);

  const applications = await Application.find(filter)
    .populate({
      path: 'job',
      select: 'title skills location jobType company',
      populate: { path: 'company', select: 'name logo' },
    })
    .populate('student', 'name email avatar headline location skills')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Applications fetched', applications);
});

export const updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
  const application = await Application.findById(req.params.id).populate('job');
  if (!application) throw new AppError('Application not found', 404);

  const job = application.job as unknown as { recruiter?: { toString: () => string } };
  if (String(job.recruiter) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Permission denied', 403);
  }

  const previous = application.status;
  application.status = req.body.status;
  application.statusHistory.push({
    status: req.body.status,
    note: req.body.note || '',
    updatedBy: req.user!.id,
    changedAt: new Date(),
  });
  await application.save();

  const jobTitle = (application.job as unknown as { title?: string })?.title || 'job';
  await createNotification({
    userId: String(application.student),
    type: 'Application',
    title: `Application status updated to ${req.body.status}`,
    message: `Your application for ${jobTitle} is now ${req.body.status.toLowerCase()}.`,
    link: '/dashboard/applications',
    data: { applicationId: String(application._id) },
  });

  sendSuccess(res, 200, 'Application status updated', application);
});
