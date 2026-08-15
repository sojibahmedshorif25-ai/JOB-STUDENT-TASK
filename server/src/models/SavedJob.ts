import { Schema, model, InferSchemaType } from 'mongoose';

const savedJobSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  },
  { timestamps: true },
);

savedJobSchema.index({ student: 1, job: 1 }, { unique: true });

export type SavedJobType = InferSchemaType<typeof savedJobSchema>;
export const SavedJob = model('SavedJob', savedJobSchema);
