import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

db.$connect()
  .then(() => {
    console.log('✨ Successfully connected to database');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error);
  });

export default db;
