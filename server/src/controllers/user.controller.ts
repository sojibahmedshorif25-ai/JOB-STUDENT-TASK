import { Request, Response } from 'express';
import { User } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).populate('company').populate('resume');
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, 'Profile fetched', user);
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('company')
    .populate('resume');
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, 'Profile updated', user);
});

export const getPublicProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select('name email avatar headline bio location skills github linkedin website')
    .populate('company');
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, 'Profile fetched', user);
});

export const getStudents = catchAsync(async (req: Request, res: Response) => {
  const students = await User.find({ role: 'STUDENT' })
    .select('name email avatar headline skills location isActive createdAt')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit || 50));
  sendSuccess(res, 200, 'Students fetched', students);
});
