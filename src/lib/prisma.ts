import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Optional: Add logging to see queries
// const prisma = new PrismaClient({
//   log: ['query', 'info', 'warn', 'error'],
// });

export default prisma;
