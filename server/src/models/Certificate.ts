import { Schema, model, InferSchemaType } from 'mongoose';

const certificateSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment' },
    certificateId: { type: String, unique: true, required: true },
    issueDate: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    downloadUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

export type CertificateType = InferSchemaType<typeof certificateSchema>;
export const Certificate = model('Certificate', certificateSchema);
