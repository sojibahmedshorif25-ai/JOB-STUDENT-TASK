import { Schema, model, InferSchemaType } from 'mongoose';

const lessonProgressSchema = new Schema(
  {
    lessonId: { type: Schema.Types.ObjectId, required: true },
    moduleId: { type: Schema.Types.ObjectId, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    quizScore: Number,
    quizPassed: Boolean,
  },
  { _id: false },
);

const enrollmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    progress: { type: [lessonProgressSchema], default: [] },
    percentComplete: { type: Number, default: 0 },
    currentLessonId: Schema.Types.ObjectId,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    enrolledAt: { type: Date, default: Date.now },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export type EnrollmentType = InferSchemaType<typeof enrollmentSchema>;
export const Enrollment = model('Enrollment', enrollmentSchema);
