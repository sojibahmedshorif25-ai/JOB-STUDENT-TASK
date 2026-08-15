import { Schema, model, InferSchemaType } from 'mongoose';

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['course', 'company', 'job'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true },
);

reviewSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export type ReviewType = InferSchemaType<typeof reviewSchema>;
export const Review = model('Review', reviewSchema);
