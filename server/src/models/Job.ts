import { Schema, model, InferSchemaType } from 'mongoose';

const jobSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, index: true },
    description: { type: String, required: true, maxlength: 10000 },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    skills: { type: [String], required: true, index: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: '$' },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      default: 'Full-time',
      index: true,
    },
    experienceLevel: { type: String, default: 'Entry' },
    remoteType: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'On-site' },
    benefits: { type: [String], default: [] },
    deadline: { type: Date },
    status: { type: String, enum: ['published', 'draft', 'closed'], default: 'published', index: true },
    applicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, remoteType: 1, experienceLevel: 1, location: 1 });

export type JobType = InferSchemaType<typeof jobSchema>;
export const Job = model('Job', jobSchema);
