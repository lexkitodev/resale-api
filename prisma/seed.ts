import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeders/UserSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // Run seeders
  await new UserSeeder(prisma).run();

  console.log('✅ Seeding completed');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
