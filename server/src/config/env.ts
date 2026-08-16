import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge',
  jwtSecret: process.env.JWT_SECRET || 'skillforge-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'skillforge-better-auth-secret',
  adminLoginEmail: process.env.ADMIN_LOGIN_EMAIL || '',
  adminLoginPassword: process.env.ADMIN_LOGIN_PASSWORD || '',
  serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'SkillForge <no-reply@skillforge.dev>',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};
