import { Schema, model, InferSchemaType } from 'mongoose';

const interviewSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: ['Technical', 'Behavioral', 'HR', 'System Design', 'Mock'],
      default: 'Technical',
    },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    meetingLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    feedback: {
      score: Number,
      strengths: [String],
      weakAreas: [String],
      recommendedTopics: [String],
      comments: String,
    },
  },
  { timestamps: true },
);

interviewSchema.index({ scheduledAt: 1 });

export type InterviewType = InferSchemaType<typeof interviewSchema>;
export const Interview = model('Interview', interviewSchema);
