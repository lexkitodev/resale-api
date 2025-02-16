import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeders/UserSeeder';
import { seedCategories } from './seeders/CategorySeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // Run seeders
  await new UserSeeder(prisma).run();
  await seedCategories();

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
