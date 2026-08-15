import { Schema, model, InferSchemaType } from 'mongoose';

const quizOptionSchema = new Schema({
  text: { type: String, required: true },
});

const quizQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: { type: [quizOptionSchema], required: true, validate: {
    validator: (v: unknown[]) => Array.isArray(v) && v.length >= 2,
    message: 'A question must have at least 2 options',
  }},
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const quizSchema = new Schema({
  title: { type: String, default: 'Quiz' },
  questions: { type: [quizQuestionSchema], default: [] },
  passingScore: { type: Number, default: 70 },
  timeLimitMinutes: { type: Number, default: 10 },
});

const lessonSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'reading', 'quiz'], default: 'video' },
  duration: { type: Number, default: 0 },
  videoUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  quiz: { type: quizSchema, required: false },
  order: { type: Number, default: 0 },
});

const moduleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  lessons: { type: [lessonSchema], default: [] },
});

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, maxlength: 300 },
    longDescription: { type: String, default: '', maxlength: 10000 },
    thumbnail: { type: String, default: '' },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    category: { type: String, default: 'Development', index: true },
    technology: [{ type: String, index: true }],
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    price: { type: Number, default: 0 },
    durationHours: { type: Number, default: 0 },
    whatYouWillLearn: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    studentsEnrolled: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true },
    modules: { type: [moduleSchema], default: [] },
  },
  { timestamps: true },
);

courseSchema.index({ title: 'text', description: 'text', 'technology': 'text' });
courseSchema.index({ category: 1, level: 1, price: 1, rating: -1, studentsEnrolled: -1 });

export type CourseType = InferSchemaType<typeof courseSchema>;
export const Course = model('Course', courseSchema);
