import { PrismaClient, User } from '@prisma/client';
import { UserFactory } from './userFactory';

export class TestFactories {
  constructor(private prisma: PrismaClient) {}

  async createUser(override = {}): Promise<User> {
    return this.prisma.user.create({
      data: await UserFactory.make(override),
    });
  }

  async createUsers(count: number, override = {}): Promise<User[]> {
    const users = await UserFactory.makeMany(count, override);
    await this.prisma.user.createMany({ data: users });
    return this.prisma.user.findMany();
  }
}
