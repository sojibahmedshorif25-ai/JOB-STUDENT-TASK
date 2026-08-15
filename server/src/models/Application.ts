import { Schema, model, InferSchemaType } from 'mongoose';

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'],
      required: true,
    },
    note: String,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    resumeUrl: { type: String, default: '' },
    coverLetter: { type: String, default: '', maxlength: 5000 },
    expectedSalary: { type: Number },
    availability: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    interview: { type: Schema.Types.ObjectId, ref: 'Interview' },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

export type ApplicationType = InferSchemaType<typeof applicationSchema>;
export const Application = model('Application', applicationSchema);
