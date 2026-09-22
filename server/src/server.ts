import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';
import { User } from './models';
import bcrypt from 'bcryptjs';

const syncAdminAccount = async () => {
  try {
    const targetEmail = (env.adminLoginEmail || 'sojibahmedshorif25@gmail.com').toLowerCase().trim();
    const targetPassword = env.adminLoginPassword || 'Sojibboss@321946##';
    const hashedPassword = bcrypt.hashSync(targetPassword, 10);

    // Demote any other ADMIN accounts if not targetEmail
    await User.updateMany(
      { role: 'ADMIN', email: { $ne: targetEmail } },
      { $set: { role: 'STUDENT' } }
    );

    let admin = await User.findOne({ email: targetEmail });
    if (admin) {
      await User.updateOne(
        { _id: admin._id },
        {
          $set: {
            email: targetEmail,
            password: hashedPassword,
            name: admin.name || 'Sojib Ahmed Shorif',
            role: 'ADMIN',
            isVerified: true,
            isActive: true,
          },
        }
      );
      console.log(`[admin] Admin account synced for ${targetEmail}`);
    } else {
      await User.create({
        name: 'Sojib Ahmed Shorif',
        email: targetEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
        headline: 'Platform Administrator & Founder',
      });
      console.log(`[admin] Admin account created for ${targetEmail}`);
    }
  } catch (error) {
    console.error('[admin] Error syncing admin account:', error);
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
