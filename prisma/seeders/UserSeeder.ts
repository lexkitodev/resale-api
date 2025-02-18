import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export class UserSeeder {
  constructor(private prisma: PrismaClient) {}

  async run() {
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    // Create admin user using upsert
    await this.prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {}, // Keep existing data if user exists
      create: {
        email: 'admin@example.com',
        passwordHash: adminPassword,
        marketingEmails: false,
      },
    });

    // Create test user using upsert
    const testPassword = await bcrypt.hash('Test123!', 10);
    await this.prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {}, // Keep existing data if user exists
      create: {
        email: 'test@example.com',
        passwordHash: testPassword,
        marketingEmails: true,
      },
    });

    console.log('✅ Users seeded');
  }
}
