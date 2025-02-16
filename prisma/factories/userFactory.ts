import { User, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export class UserFactory {
  static async make(override: Partial<UserInput> = {}): Promise<Prisma.UserCreateInput> {
    const defaultUser: UserInput = {
      email: `user${Date.now()}@example.com`,
      passwordHash: await bcrypt.hash('Password123!', 10),
      marketingEmails: false,
    };

    return {
      ...defaultUser,
      ...override,
    };
  }

  static async makeMany(
    count: number,
    override: Partial<UserInput> = {}
  ): Promise<Prisma.UserCreateInput[]> {
    return Promise.all(
      Array.from({ length: count }, async (_, index) => {
        return this.make({
          email: `user${Date.now() + index}@example.com`,
          ...override,
        });
      })
    );
  }
}
