import { Request, Response } from 'express';
import { Project } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { escapeRegex } from '../utils/helpers';

export const getProjects = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
  const { search, technology, sort } = req.query;

  const filter: Record<string, unknown> = { published: true };
  if (search) {
    const safe = escapeRegex(String(search));
    filter.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { techStack: { $regex: safe, $options: 'i' } },
    ];
  }
  if (technology && technology !== 'All') filter.techStack = String(technology);

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    popular: { likes: -1 },
    views: { views: -1 },
  };
  const sortQuery = sortOptions[String(sort || 'newest')] || sortOptions.newest;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('author', 'name avatar headline')
      .populate('course', 'title slug')
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Projects fetched', projects, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getProject = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true },
  )
    .populate('author', 'name avatar headline bio github linkedin skills')
    .populate('course', 'title slug');
  if (!project) throw new AppError('Project not found', 404);
  sendSuccess(res, 200, 'Project fetched', project);
});

export const getMyProjects = catchAsync(async (req: Request, res: Response) => {
  const projects = await Project.find({ author: req.user!.id }).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Projects fetched', projects);
});

export const createProject = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.create({ ...req.body, author: req.user!.id });
  sendSuccess(res, 201, 'Project created', project);
});

export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found', 404);
  if (String(project.author) !== req.user!.id) throw new AppError('Permission denied', 403);

  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, 200, 'Project updated', updated);
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found', 404);
  if (String(project.author) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Permission denied', 403);
  }
  await Project.findByIdAndDelete(req.params.id);
  sendSuccess(res, 200, 'Project deleted');
});

export const togglePublish = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found', 404);
  if (String(project.author) !== req.user!.id) throw new AppError('Permission denied', 403);
  project.published = !project.published;
  await project.save();
  sendSuccess(res, 200, 'Project visibility updated', { published: project.published });
});

export const likeProject = catchAsync(async (req: Request, res: Response) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true },
  );
  if (!project) throw new AppError('Project not found', 404);
  sendSuccess(res, 200, 'Project liked', { likes: project.likes });
});
