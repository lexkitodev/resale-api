import prisma from '../../src/lib/prisma';
import { faker } from '@faker-js/faker';

export async function seedItems() {
  const categories = await prisma.category.findMany();

  // Create 25 items for each category
  for (const category of categories) {
    const items = Array.from({ length: 25 }, () => ({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      startPrice: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      retailPrice: parseFloat(faker.commerce.price({ min: 100, max: 1000 })),
      imageUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(10)}/400/400`,
      endTime: faker.date.future(),
    }));

    for (const item of items) {
      // Create item with category connection
      await prisma.item.create({
        data: {
          ...item,
          categories: {
            connect: [{ id: category.id }],
          },
        },
      });
    }
  }

  console.log('✅ Items seeded successfully');
}
