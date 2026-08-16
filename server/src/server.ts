import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';
import { User } from './models';
import bcrypt from 'bcryptjs';

const syncAdminAccount = async () => {
  if (!env.adminLoginEmail || !env.adminLoginPassword) return;
  const admin = await User.findOne({ role: 'ADMIN' });
  if (!admin) return;

  const update: { email?: string; password?: string; name?: string } = {};
  if (admin.email !== env.adminLoginEmail) {
    update.email = env.adminLoginEmail;
    update.name = 'Sojib Ahmed Shorif';
  }
  const isMatch = await bcrypt.compare(env.adminLoginPassword, admin.password || '');
  if (!isMatch) {
    update.password = bcrypt.hashSync(env.adminLoginPassword, 10);
  }
  if (Object.keys(update).length > 0) {
    await User.updateOne({ _id: admin._id }, { $set: update });
    console.log('[admin] Admin account synced with environment');
  }
};

const start = async () => {
  try {
    await connectDB();
    await syncAdminAccount();
    app.listen(env.port, () => {
      console.log(`⚡ SkillForge API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
