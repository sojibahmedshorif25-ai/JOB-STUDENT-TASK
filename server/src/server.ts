import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';

const start = async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`⚡ SkillForge API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
