import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { env } from '../config/env';

const FOLDERS: Record<string, string> = {
  avatar: 'skillforge/avatars',
  logo: 'skillforge/logos',
  thumbnail: 'skillforge/thumbnails',
  project: 'skillforge/projects',
  resume: 'skillforge/resumes',
  general: 'skillforge/general',
};

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const folder = FOLDERS[String(req.query.folder || 'general')] || FOLDERS.general;

  // Cloudinary is optional; if not configured, fall back to a placeholder
  if (!env.cloudinaryCloudName) {
    sendSuccess(res, 200, 'File upload skipped (Cloudinary not configured)', {
      url: '',
      note: 'Set CLOUDINARY_* environment variables to enable file storage.',
    });
    return;
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder, resource_type: 'auto' },
    (error, result) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Upload failed',
          errors: [error.message],
        });
      }
      sendSuccess(res, 200, 'File uploaded', {
        url: result?.secure_url,
        publicId: result?.public_id,
        width: result?.width,
        height: result?.height,
      });
    },
  );

  uploadStream.end(req.file.buffer);
});
