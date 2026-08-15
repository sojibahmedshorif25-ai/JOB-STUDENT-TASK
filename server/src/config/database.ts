import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

const canResolveSrv = (): Promise<boolean> =>
  new Promise((resolve) => {
    const host = new URL(env.mongoUri).hostname;
    dns.resolveSrv(`_mongodb._tcp.${host}`, (err) => resolve(!err));
  });

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    if (env.mongoUri.startsWith('mongodb+srv://') && !(await canResolveSrv())) {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
      console.log('System DNS blocked SRV lookups - falling back to public DNS');
    }
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
