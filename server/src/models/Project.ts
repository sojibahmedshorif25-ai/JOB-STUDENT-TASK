import { Schema, model, InferSchemaType } from 'mongoose';

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 5000 },
    features: { type: [String], default: [] },
    techStack: { type: [String], required: true, default: [] },
    thumbnail: { type: String, default: '' },
    screenshots: { type: [String], default: [] },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

projectSchema.index({ title: 'text', description: 'text', techStack: 'text' });
projectSchema.index({ published: 1, createdAt: -1 });

export type ProjectType = InferSchemaType<typeof projectSchema>;
export const Project = model('Project', projectSchema);
