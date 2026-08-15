import { Notification } from '../models';

interface CreateNotificationInput {
  userId: string;
  type: 'Course' | 'Job' | 'Application' | 'Interview' | 'Certificate' | 'System';
  title: string;
  message?: string;
  link?: string;
  data?: Record<string, unknown>;
}

export const createNotification = async (input: CreateNotificationInput) => {
  try {
    return await Notification.create(input);
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};
