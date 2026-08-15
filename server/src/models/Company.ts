import { Schema, model, InferSchemaType } from 'mongoose';

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, unique: true, index: true },
    logo: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 3000 },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    size: { type: String, default: '' },
    headquarters: { type: String, default: '' },
    foundedYear: { type: Number },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
    verified: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true },
);

companySchema.index({ name: 'text' });

export type CompanyType = InferSchemaType<typeof companySchema>;
export const Company = model('Company', companySchema);
