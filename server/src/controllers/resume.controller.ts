import { Request, Response } from 'express';
import { Resume } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';

export const getMyResume = catchAsync(async (req: Request, res: Response) => {
  let resume = await Resume.findOne({ user: req.user!.id });
  if (!resume) {
    const user = await (await import('../models')).User.findById(req.user!.id);
    const personal = {
      fullName: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      github: user?.github || '',
      linkedin: user?.linkedin || '',
      website: user?.website || '',
      title: user?.headline || '',
      summary: user?.bio || '',
    };
    resume = await Resume.create({ user: req.user!.id, personal });
  }
  sendSuccess(res, 200, 'Resume fetched', resume);
});

export const saveResume = catchAsync(async (req: Request, res: Response) => {
  const resume = await Resume.findOneAndUpdate(
    { user: req.user!.id },
    { ...req.body, user: req.user!.id },
    { new: true, upsert: true, runValidators: true },
  );

  await (await import('../models')).User.findByIdAndUpdate(req.user!.id, { resume: resume?._id });

  sendSuccess(res, 200, 'Resume saved', resume);
});
