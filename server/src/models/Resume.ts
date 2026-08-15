import { Schema, model, InferSchemaType } from 'mongoose';

const resumeSectionSchema = new Schema(
  {
    type: { type: String, required: true },
    title: { type: String, default: '' },
    order: { type: Number, default: 0 },
    items: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: true },
);

const resumeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    personal: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      website: String,
      linkedin: String,
      github: String,
      title: String,
      summary: String,
    },
    sections: { type: [resumeSectionSchema], default: [] },
    template: { type: String, default: 'modern' },
    primaryColor: { type: String, default: '#4f46e5' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    isComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type ResumeType = InferSchemaType<typeof resumeSchema>;
export const Resume = model('Resume', resumeSchema);
