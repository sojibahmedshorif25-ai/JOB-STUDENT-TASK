import { Schema, model, InferSchemaType } from 'mongoose';

const interviewQuestionSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  topic: { type: String, index: true },
  hints: { type: [String], default: [] },
});

interviewQuestionSchema.index({ category: 1, topic: 1, difficulty: 1 });

export type InterviewQuestionType = InferSchemaType<typeof interviewQuestionSchema>;
export const InterviewQuestion = model('InterviewQuestion', interviewQuestionSchema);
