import { Schema, model, InferSchemaType } from 'mongoose';

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['Course', 'Job', 'Application', 'Interview', 'Certificate', 'System'],
      default: 'System',
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export type NotificationType = InferSchemaType<typeof notificationSchema>;
export const Notification = model('Notification', notificationSchema);
