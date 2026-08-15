import { Request, Response } from 'express';
import { Notification } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/sendSuccess';

export const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const { limit = 50, unreadOnly } = req.query;
  const filter: Record<string, unknown> = { user: req.user!.id };
  if (unreadOnly === 'true') filter.read = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(Number(limit)),
    Notification.countDocuments({ user: req.user!.id, read: false }),
  ]);

  sendSuccess(res, 200, 'Notifications fetched', notifications, { unreadCount });
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.id },
    { read: true },
    { new: true },
  );
  if (!notification) sendSuccess(res, 404, 'Notification not found', null);
  else sendSuccess(res, 200, 'Notification marked as read', notification);
});

export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user!.id, read: false }, { read: true });
  sendSuccess(res, 200, 'All notifications marked as read');
});

export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user!.id });
  sendSuccess(res, 200, 'Notification deleted');
});
