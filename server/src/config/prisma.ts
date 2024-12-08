import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

// Type definitions
declare global {
  var db: PrismaClient | undefined
}

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const db = global.db || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') global.db = db;


db.$connect()
.then(() => {
  console.log('✨ Successfully connected to database');
})
.catch((error) => {
  console.error('❌ Failed to connect to database:', error);
});

export default db;
