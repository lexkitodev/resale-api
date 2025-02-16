import { PrismaClient } from '@prisma/client';
import { UserFactory } from '../factories/userFactory';

export class UserSeeder {
  constructor(private prisma: PrismaClient) {}

  async run() {
    // Create admin user
    await this.prisma.user.create({
      data: await UserFactory.make({
        email: 'admin@bidhub.com',
        marketingEmails: true,
      }),
    });

    // Create test user
    await this.prisma.user.create({
      data: await UserFactory.make({
        email: 'test@example.com',
      }),
    });

    // Create random users
    const randomUsers = await UserFactory.makeMany(5);
    await this.prisma.user.createMany({
      data: randomUsers,
    });
  }
}
