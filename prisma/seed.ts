import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeders/UserSeeder';
import { seedCategories } from './seeders/CategorySeeder';
import { seedItems } from './seeders/ItemSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // Run seeders in order
  await new UserSeeder(prisma).run();
  await seedCategories();
  await seedItems();

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
