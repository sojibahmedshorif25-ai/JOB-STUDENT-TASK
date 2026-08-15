import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false, minlength: 6 },
    role: {
      type: String,
      enum: ['STUDENT', 'RECRUITER', 'ADMIN'],
      default: 'STUDENT',
      index: true,
    },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    headline: { type: String, default: '', maxlength: 160 },
    bio: { type: String, default: '', maxlength: 1000 },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    skills: [{ type: String, trim: true }],
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ name: 'text', email: 'text' });

export type UserType = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
