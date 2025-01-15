import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Type definitions
declare global {
  var db: PrismaClient | undefined
}

const db = global.db || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.db = db;


db.$connect()
  .then(() => {
    console.log('✨ Successfully connected to database');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error);
  });

export default db;