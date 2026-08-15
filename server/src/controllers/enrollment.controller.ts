import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Course, Enrollment, Certificate } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { createNotification } from '../services/notification.service';

export const enroll = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId;

  if (!mongoose.Types.ObjectId.isValid(String(courseId))) throw new AppError('Invalid course id', 400);

  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  const existing = await Enrollment.findOne({ user: req.user!.id, course: courseId });
  if (existing) throw new AppError('Already enrolled in this course', 409);

  const lessonEntries = (course.modules || []).flatMap((module) =>
    (module.lessons || []).map((lesson) => ({
      lessonId: lesson._id,
      moduleId: module._id,
      completed: false,
    })),
  );

  const enrollment = await Enrollment.create({
    user: req.user!.id,
    course: courseId,
    progress: lessonEntries,
    currentLessonId: course.modules?.[0]?.lessons?.[0]?._id || null,
  });

  await Course.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: 1 } });

  await createNotification({
    userId: req.user!.id,
    type: 'Course',
    title: `Enrolled in ${course.title}`,
    message: 'Good luck with your learning journey!',
    link: `/learn/${courseId}`,
  });

  sendSuccess(res, 201, 'Enrolled successfully', enrollment);
});

export const getMyCourses = catchAsync(async (req: Request, res: Response) => {
  const enrollments = await Enrollment.find({ user: req.user!.id })
    .populate({
      path: 'course',
      select: 'title slug thumbnail category level durationHours modules technology',
    })
    .sort({ lastAccessedAt: -1 });

  sendSuccess(res, 200, 'Enrollments fetched', enrollments);
});

export const getEnrollmentForCourse = catchAsync(async (req: Request, res: Response) => {
  const enrollment = await Enrollment.findOne({
    user: req.user!.id,
    course: req.params.courseId,
  }).populate({
    path: 'course',
    populate: { path: 'instructor', select: 'name avatar' },
  });

  if (!enrollment) throw new AppError('You are not enrolled in this course', 404);

  sendSuccess(res, 200, 'Enrollment fetched', enrollment);
});

export const markLessonComplete = catchAsync(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.body;

  const enrollment = await Enrollment.findOne({ user: req.user!.id, course: courseId });
  if (!enrollment) throw new AppError('Enrollment not found', 404);

  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  const entry = enrollment.progress.find((p) => String(p.lessonId) === String(lessonId));
  if (entry) {
    entry.completed = true;
    entry.completedAt = new Date();
  }

  const totalLessons = (course.modules || []).reduce(
    (acc, module) => acc + (module.lessons?.length || 0),
    0,
  );
  const completedLessons = enrollment.progress.filter((p) => p.completed).length;
  enrollment.percentComplete =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  if (enrollment.percentComplete >= 100 && !enrollment.completed) {
    enrollment.completed = true;
    enrollment.completedAt = new Date();
    await issueCertificate(req.user!.id, courseId, enrollment._id);
  }

  enrollment.lastAccessedAt = new Date();
  await enrollment.save();

  sendSuccess(res, 200, 'Lesson marked complete', {
    percentComplete: enrollment.percentComplete,
    completed: enrollment.completed,
  });
});

const issueCertificate = async (userId: string, courseId: string, enrollmentId: unknown) => {
  const existing = await Certificate.findOne({ user: userId, course: courseId });
  if (existing) return existing;

  const certId = `SF-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  const certificate = await Certificate.create({
    user: userId,
    course: courseId,
    enrollment: enrollmentId,
    certificateId: certId,
  });

  await createNotification({
    userId,
    type: 'Certificate',
    title: 'Congratulations! You earned a certificate 🎉',
    message: `Your certificate ${certId} is now available.`,
    link: `/dashboard/certificates`,
  });

  return certificate;
};

export const getMyCertificates = catchAsync(async (req: Request, res: Response) => {
  const certificates = await Certificate.find({ user: req.user!.id })
    .populate('course', 'title slug thumbnail category')
    .sort({ issueDate: -1 });
  sendSuccess(res, 200, 'Certificates fetched', certificates);
});

export const verifyCertificate = catchAsync(async (req: Request, res: Response) => {
  const certificate = await Certificate.findOne({ certificateId: req.params.id }).populate(
    'user',
    'name email',
  ).populate('course', 'title');
  if (!certificate) throw new AppError('Certificate not found', 404);
  sendSuccess(res, 200, 'Certificate verified', certificate);
});
