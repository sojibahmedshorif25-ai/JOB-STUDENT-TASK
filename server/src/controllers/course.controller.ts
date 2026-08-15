import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Course, Review, Enrollment } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/sendSuccess';
import { createUniqueSlug } from '../services/slug.service';
import { escapeRegex } from '../utils/helpers';
import { gradeQuiz, updateEnrollmentAfterQuiz } from '../services/quiz.service';

const buildCourseQuery = (query: Request['query']) => {
  const { search, category, level, technology, difficulty, minRating, maxPrice, featured, sort } =
    query;

  const filter: Record<string, unknown> = { published: true };

  if (search) {
    const safe = escapeRegex(String(search));
    filter.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { technology: { $regex: safe, $options: 'i' } },
    ];
  }
  if (category && category !== 'All') filter.category = String(category);
  if (level && level !== 'All') filter.level = String(level);
  if (technology && technology !== 'All') filter.technology = String(technology);
  if (difficulty && difficulty !== 'All') filter.level = String(difficulty);
  if (featured === 'true') filter.featured = true;
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (maxPrice) filter.price = { $lte: Number(maxPrice) };

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    popular: { studentsEnrolled: -1 },
    rating: { rating: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    title: { title: 1 },
  };
  const sortQuery = sortOptions[String(sort || 'popular')] || sortOptions.popular;

  return { filter, sortQuery };
};

export const getCourses = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
  const { filter, sortQuery } = buildCourseQuery(req.query);

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name avatar headline')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Courses fetched', courses, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getCourseBySlug = catchAsync(async (req: Request, res: Response) => {
  const course = await Course.findOne({ slug: req.params.slug }).populate(
    'instructor',
    'name avatar headline bio',
  );
  if (!course) throw new AppError('Course not found', 404);

  const isEnrolled = req.user
    ? !!(await Enrollment.findOne({ user: req.user.id, course: course._id }))
    : false;

  sendSuccess(res, 200, 'Course fetched', { ...course.toObject(), isEnrolled });
});

export const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  sendSuccess(res, 200, 'Course fetched', course);
});

export const createCourse = catchAsync(async (req: Request, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Only admins can create courses', 403);
  }
  const slug = await createUniqueSlug(Course as never, req.body.title);
  const course = await Course.create({ ...req.body, slug, instructor: req.user!.id });
  sendSuccess(res, 201, 'Course created', course);
});

export const updateCourse = catchAsync(async (req: Request, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Only admins can update courses', 403);
  }
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) throw new AppError('Course not found', 404);
  sendSuccess(res, 200, 'Course updated', course);
});

export const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Only admins can delete courses', 403);
  }
  await Course.findByIdAndDelete(req.params.id);
  await Enrollment.deleteMany({ course: req.params.id });
  sendSuccess(res, 200, 'Course deleted');
});

export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await Course.distinct('category', { published: true });
  const technologies = await Course.distinct('technology', { published: true });
  sendSuccess(res, 200, 'Filters fetched', { categories, technologies });
});

export const getCourseReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await Review.find({
    targetType: 'course',
    targetId: req.params.id,
  }).populate('user', 'name avatar');
  sendSuccess(res, 200, 'Reviews fetched', reviews);
});

export const createCourseReview = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.id;
  const existing = await Review.findOne({
    user: req.user!.id,
    targetType: 'course',
    targetId: courseId,
  });
  if (existing) {
    existing.rating = req.body.rating;
    existing.title = req.body.title || '';
    existing.comment = req.body.comment || '';
    await existing.save();
  } else {
    await Review.create({
      user: req.user!.id,
      targetType: 'course',
      targetId: courseId,
      rating: req.body.rating,
      title: req.body.title || '',
      comment: req.body.comment || '',
    });
  }

  const aggregate = await Review.aggregate([
    { $match: { targetType: 'course', targetId: new mongoose.Types.ObjectId(String(courseId)) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (aggregate.length) {
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(aggregate[0].avg * 10) / 10,
      ratingCount: aggregate[0].count,
    });
  }

  sendSuccess(res, 200, 'Review saved');
});

export const submitQuiz = catchAsync(async (req: Request, res: Response) => {
  const { courseId, moduleId, lessonId, answers } = req.body;

  const grade = await gradeQuiz(courseId, moduleId, lessonId, answers);
  await updateEnrollmentAfterQuiz(req.user!.id, courseId, moduleId, lessonId, grade);

  sendSuccess(res, 200, 'Quiz submitted', grade);
});
