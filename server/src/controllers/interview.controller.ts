import { Request, Response } from 'express';
import { InterviewQuestion, InterviewProgress, Application, Interview, Job } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { createNotification } from '../services/notification.service';

const CATEGORIES = [
  'JavaScript',
  'React',
  'Next.js',
  'Node.js',
  'MongoDB',
  'MERN',
  'Frontend',
  'Backend',
  'Behavioral',
];

export const getQuestionCategories = catchAsync(async (_req: Request, res: Response) => {
  const counts = await InterviewQuestion.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  sendSuccess(res, 200, 'Categories fetched', CATEGORIES.map((name) => {
    const found = counts.find((c) => c._id === name);
    return { name, count: found?.count || 0 };
  }));
});

export const getQuestions = catchAsync(async (req: Request, res: Response) => {
  const { category, topic, difficulty, limit } = req.query;
  const filter: Record<string, unknown> = {};
  if (category && category !== 'All') filter.category = String(category);
  if (topic) filter.topic = String(topic);
  if (difficulty && difficulty !== 'All') filter.difficulty = String(difficulty);

  const questions = await InterviewQuestion.find(filter)
    .limit(Math.min(50, Number(limit || 20)))
    .sort({ difficulty: 1 });
  sendSuccess(res, 200, 'Questions fetched', questions);
});

export const getTopics = catchAsync(async (req: Request, res: Response) => {
  const category = String(req.query.category || '');
  const filter = category && category !== 'All' ? { category } : {};
  const topics = await InterviewQuestion.distinct('topic', filter);
  sendSuccess(res, 200, 'Topics fetched', topics.filter(Boolean));
});

export const getMockQuestions = catchAsync(async (req: Request, res: Response) => {
  const { category, count } = req.query;
  const filter: Record<string, unknown> = {};
  if (category && category !== 'All') filter.category = String(category);

  const total = await InterviewQuestion.countDocuments(filter);
  const limit = Math.min(10, Number(count || 5));

  const pipeline: Record<string, unknown>[] = [
    { $match: filter },
    { $sample: { size: Math.min(limit, Math.max(1, total)) } },
    { $project: { answer: 0 } },
  ];
  const questions = await InterviewQuestion.aggregate(pipeline as never);
  sendSuccess(res, 200, 'Mock questions fetched', questions);
});

export const saveProgress = catchAsync(async (req: Request, res: Response) => {
  const progress = await InterviewProgress.create({ ...req.body, user: req.user!.id });
  sendSuccess(res, 201, 'Progress saved', progress);
});

export const getMyProgress = catchAsync(async (req: Request, res: Response) => {
  const progress = await InterviewProgress.find({ user: req.user!.id })
    .populate('questionId', 'question category topic difficulty')
    .sort({ createdAt: -1 })
    .limit(100);
  sendSuccess(res, 200, 'Progress fetched', progress);
});

export const getMyInterviews = catchAsync(async (req: Request, res: Response) => {
  const interviews = await Interview.find({ student: req.user!.id })
    .populate('job', 'title company')
    .populate('recruiter', 'name')
    .sort({ scheduledAt: -1 });
  sendSuccess(res, 200, 'Interviews fetched', interviews);
});

export const getRecruiterInterviews = catchAsync(async (req: Request, res: Response) => {
  const interviews = await Interview.find({ recruiter: req.user!.id })
    .populate('job', 'title company')
    .populate('student', 'name avatar headline')
    .sort({ scheduledAt: -1 });
  sendSuccess(res, 200, 'Interviews fetched', interviews);
});

export const scheduleInterview = catchAsync(async (req: Request, res: Response) => {
  const { applicationId, type, scheduledAt, durationMinutes, meetingLink, notes } = req.body;

  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('student');
  if (!application) throw new AppError('Application not found', 404);

  const job = application.job as unknown as { recruiter?: { toString: () => string } };
  if (String(job.recruiter) !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError('Permission denied', 403);
  }

  const interview = await Interview.create({
    application: applicationId,
    job: application.job,
    student: application.student,
    recruiter: req.user!.id,
    type,
    scheduledAt: new Date(scheduledAt),
    durationMinutes,
    meetingLink,
    notes,
  });

  application.interview = interview._id;
  application.status = 'Interview';
  application.statusHistory.push({
    status: 'Interview',
    note: 'Interview scheduled',
    updatedBy: req.user!.id,
    changedAt: new Date(),
  });
  await application.save();

  const jobTitle = (application.job as unknown as { title?: string })?.title || 'position';
  await createNotification({
    userId: String(application.student),
    type: 'Interview',
    title: `Interview scheduled for ${jobTitle}`,
    message: `${type} interview on ${new Date(scheduledAt).toLocaleString()}${meetingLink ? ` · ${meetingLink}` : ''}`,
    link: '/dashboard/applications',
    data: { interviewId: String(interview._id) },
  });

  sendSuccess(res, 201, 'Interview scheduled', interview);
});

export const updateInterviewStatus = catchAsync(async (req: Request, res: Response) => {
  const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!interview) throw new AppError('Interview not found', 404);
  sendSuccess(res, 200, 'Interview updated', interview);
});

export const submitInterviewFeedback = catchAsync(async (req: Request, res: Response) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError('Interview not found', 404);
  interview.feedback = req.body;
  interview.status = 'completed';
  await interview.save();

  await createNotification({
    userId: String(interview.student),
    type: 'Interview',
    title: 'Interview feedback received',
    message: 'Your recruiter has submitted feedback for your interview.',
    link: '/dashboard/applications',
  });

  sendSuccess(res, 200, 'Feedback saved', interview);
});
