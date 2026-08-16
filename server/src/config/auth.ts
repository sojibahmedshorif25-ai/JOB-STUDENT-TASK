import { MongoClient, Db } from 'mongodb';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { env } from './env';

let db: Db;
export const mongoClient = new MongoClient(env.mongoUri);

const getDb = () => {
  if (!db) {
    db = mongoClient.db();
  }
  return db;
};

export const auth = betterAuth({
  secret: env.betterAuthSecret,
  baseURL: env.serverUrl,
  basePath: '/api/auth',
  database: mongodbAdapter(getDb(), { client: mongoClient }),
  trustedOrigins: env.clientUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  advanced: {
    ipAddress: {
      trustedProxies: ['0.0.0.0/0'],
      ipAddressHeaders: ['x-forwarded-for'],
    },
  },
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    },
  },
});
