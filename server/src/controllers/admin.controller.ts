import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  User,
  Company,
  Course,
  Job,
  Application,
  Project,
  Certificate,
  Enrollment,
} from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';

export const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const [totalUsers, students, recruiters, companies, courses, jobs, applications, projects] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'RECRUITER' }),
      Company.countDocuments(),
      Course.countDocuments(),
      Job.countDocuments({ status: 'published' }),
      Application.countDocuments(),
      Project.countDocuments(),
    ]);

  const [activeUsers, activeJobs, totalApplications, pendingApplications] = await Promise.all([
    User.countDocuments({ isActive: true, lastLoginAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
    Job.countDocuments({ status: 'published', createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
    Application.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
    Application.countDocuments({ status: 'Applied' }),
  ]);

  sendSuccess(res, 200, 'Admin dashboard fetched', {
    totalUsers,
    activeUsers,
    students,
    recruiters,
    companies,
    courses,
    jobs,
    activeJobs,
    applications,
    totalApplications,
    pendingApplications,
    projects,
  });
});

export const getUserGrowth = catchAsync(async (_req: Request, res: Response) => {
  const days = Number(_req.query.days || 30);
  const since = new Date(Date.now() - days * 86400000);

  const [userGrowth, enrollments, applications, applicationsByStatus, popularSkills] =
    await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Enrollment.aggregate([
        { $match: { enrolledAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Job.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

  sendSuccess(res, 200, 'Analytics fetched', {
    userGrowth,
    enrollments,
    applications,
    applicationsByStatus,
    popularSkills,
  });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Number(req.query.limit || 20));
  const { role, search, status } = req.query;

  const filter: Record<string, unknown> = {};
  if (role && role !== 'All') filter.role = String(role);
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: safe, $options: 'i' } }, { email: { $regex: safe, $options: 'i' } }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role avatar isActive createdAt company')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Users fetched', users, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, 'User status updated', user);
});

export const getRecruiters = catchAsync(async (req: Request, res: Response) => {
  const recruiters = await User.find({ role: 'RECRUITER' })
    .select('name email avatar isActive createdAt company')
    .populate('company', 'name logo verified')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit || 50));
  sendSuccess(res, 200, 'Recruiters fetched', recruiters);
});

export const getAdminCompanies = catchAsync(async (req: Request, res: Response) => {
  const companies = await Company.find()
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit || 50));
  sendSuccess(res, 200, 'Companies fetched', companies);
});

export const verifyCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { verified: req.body.verified },
    { new: true },
  );
  if (!company) throw new AppError('Company not found', 404);
  sendSuccess(res, 200, 'Company verification updated', company);
});

export const getAdminCourses = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Number(req.query.limit || 20));
  const { search, published } = req.query;

  const filter: Record<string, unknown> = {};
  if (published === 'true') filter.published = true;
  if (published === 'false') filter.published = false;
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: safe, $options: 'i' };
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select('title slug category level price studentsEnrolled featured published createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Courses fetched', courses, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

export const getAdminJobs = catchAsync(async (req: Request, res: Response) => {
  const jobs = await Job.find()
    .populate('company', 'name logo')
    .populate('recruiter', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit || 50));
  sendSuccess(res, 200, 'Jobs fetched', jobs);
});

export const getAdminApplications = catchAsync(async (req: Request, res: Response) => {
  const applications = await Application.find()
    .populate({ path: 'job', select: 'title', populate: { path: 'company', select: 'name' } })
    .populate('student', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit || 50));
  sendSuccess(res, 200, 'Applications fetched', applications);
});

export const getAdminProjects = catchAsync(async (req: Request, res: Response) => {
  const projects = await Project.find()
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit || 50));
  sendSuccess(res, 200, 'Projects fetched', projects);
});

export const getCertificates = catchAsync(async (_req: Request, res: Response) => {
  const certificates = await Certificate.find()
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ issueDate: -1 })
    .limit(Number(_req.query.limit || 50));
  sendSuccess(res, 200, 'Certificates fetched', certificates);
});

export const getReports = catchAsync(async (req: Request, res: Response) => {
  const { type = 'all' } = req.query;
  const since = new Date(Date.now() - 30 * 86400000);

  const reports: Record<string, unknown> = {};

  if (type === 'all' || type === 'users') {
    reports.usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    reports.usersByProvider = await User.aggregate([
      { $group: { _id: '$provider', count: { $sum: 1 } } },
    ]);
  }
  if (type === 'all' || type === 'applications') {
    reports.applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    reports.applicationsThisMonth = await Application.countDocuments({ createdAt: { $gte: since } });
  }
  if (type === 'all' || type === 'jobs') {
    reports.jobsByType = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
    ]);
    reports.popularSkills = await Job.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: { $toLower: '$skills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  }
  if (type === 'all' || type === 'courses') {
    reports.coursesByLevel = await Course.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);
    reports.topCourses = await Course.find().sort({ studentsEnrolled: -1 }).limit(5).select('title studentsEnrolled rating');
  }

  sendSuccess(res, 200, 'Reports fetched', reports);
});

export const dashboardHealth = catchAsync(async (_req: Request, res: Response) => {
  sendSuccess(res, 200, 'OK', { status: 'healthy', db: mongoose.connection.readyState === 1 });
});
