import prisma from '../../src/lib/prisma';

export async function seedCategories() {
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Phones, laptops, tablets, and other electronic devices',
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Furniture, decor, and outdoor equipment',
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, shoes, and accessories',
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and athletic gear',
    },
    {
      name: 'Collectibles',
      slug: 'collectibles',
      description: 'Rare items, antiques, and memorabilia',
    },
    {
      name: 'Vehicles',
      slug: 'vehicles',
      description: 'Cars, motorcycles, and automotive parts',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('Categories seeded successfully');
}
