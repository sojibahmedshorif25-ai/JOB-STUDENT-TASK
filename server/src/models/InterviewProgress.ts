import { Schema, model, InferSchemaType } from 'mongoose';

const interviewProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'InterviewQuestion' },
    answer: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    feedback: String,
    timeTakenSeconds: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type InterviewProgressType = InferSchemaType<typeof interviewProgressSchema>;
export const InterviewProgress = model('InterviewProgress', interviewProgressSchema);
