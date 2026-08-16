import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Company } from '../models';
import { signToken } from '../utils/token';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { createUniqueSlug } from '../services/slug.service';
import { createNotification } from '../services/notification.service';
import { sendMail } from '../services/mail.service';
import { auth } from '../config/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { env } from '../config/env';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role, companyName } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  let companyId: string | undefined;
  if (role === 'RECRUITER' && companyName) {
    const slug = await createUniqueSlug(Company as never, companyName);
    const company = await Company.create({
      name: companyName,
      slug,
      owner: null as unknown as string,
      verified: false,
    });
    companyId = (company as unknown as { _id: string })._id;
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    company: companyId,
    isVerified: true,
  });

  if (companyId) {
    await Company.findByIdAndUpdate(companyId, { owner: user._id });
  }

  const token = signToken({ id: String(user._id), role: user.role, email: user.email });

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    headline: user.headline,
    company: user.company,
  };

  await createNotification({
    userId: String(user._id),
    type: 'System',
    title: `Welcome to SkillForge, ${user.name}! 🎉`,
    message: 'Complete your profile to unlock the best learning and career tools.',
    link: '/dashboard',
  });

  sendSuccess(res, 201, 'Account created successfully', { token, user: safeUser });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  if (!user.isActive) throw new AppError('This account has been deactivated', 403);

  if (user.role === 'ADMIN' && env.adminLoginEmail && user.email !== env.adminLoginEmail) {
    throw new AppError('Admin access is restricted', 403);
  }

  const token = signToken({ id: String(user._id), role: user.role, email: user.email });

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    headline: user.headline,
    company: user.company,
  };

  sendSuccess(res, 200, 'Login successful', { token, user: safeUser });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  sendSuccess(res, 200, 'Logged out successfully');
});

export const me = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id)
    .populate('company')
    .populate('resume');
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, 'User fetched', user);
});

export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user?.email) {
    throw new AppError('Google session not found. Please sign in with Google again.', 401);
  }

  const { email, name, image } = session.user;
  const role = req.body.role;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      avatar: image || '',
      provider: 'google',
      role: role || 'STUDENT',
      isVerified: true,
    });
    await createNotification({
      userId: String(user._id),
      type: 'System',
      title: `Welcome to SkillForge, ${user.name}! 🎉`,
      message: 'Complete your profile to unlock the best learning and career tools.',
      link: '/dashboard',
    });
  }

  const token = signToken({ id: String(user._id), role: user.role, email: user.email });

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    headline: user.headline,
    company: user.company,
  };

  sendSuccess(res, 200, 'Google authentication successful', { token, user: safeUser });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    const token = jwt.sign({ id: String(user._id), purpose: 'password-reset' }, env.jwtSecret, {
      expiresIn: '1h',
    });
    const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
    await sendMail({
      to: email,
      subject: 'Reset your SkillForge password',
      text: `Reset your password (valid for 1 hour): ${resetUrl}`,
      html: `<p>We received a request to reset your SkillForge password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link is valid for <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>`,
    });
  }

  sendSuccess(res, 200, 'If an account exists with that email, a reset link has been sent.');
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  let payload: { id: string; purpose: string };
  try {
    payload = jwt.verify(token, env.jwtSecret) as { id: string; purpose: string };
  } catch {
    throw new AppError('Invalid or expired reset token', 400);
  }
  if (payload.purpose !== 'password-reset') {
    throw new AppError('Invalid reset token', 400);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  sendSuccess(res, 200, 'Password reset successful. You can now login.');
});
