import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

// Define the Item type based on Prisma schema
type Item = {
  id: number;
  title: string;
  description: string | null;
  startPrice: Prisma.Decimal;
  currentBid: Prisma.Decimal | null;
  retailPrice: Prisma.Decimal;
  imageUrl: string;
  endTime: Date;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
};

export class CategoryController {
  static async getAll(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getItems(req: Request, res: Response) {
    console.log('getItems');

    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 12;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.item.findMany({
          where: {
            categories: {
              some: { slug },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
          select: {
            id: true,
            title: true,
            description: true,
            startPrice: true,
            currentBid: true,
            retailPrice: true,
            imageUrl: true,
            endTime: true,
          },
        }),
        prisma.item.count({
          where: {
            categories: {
              some: { slug },
            },
          },
        }),
      ]);

      // Convert Decimal to number for JSON response
      const formattedItems = items.map((item: Item) => ({
        ...item,
        startPrice: Number(item.startPrice),
        currentBid: item.currentBid ? Number(item.currentBid) : null,
        retailPrice: Number(item.retailPrice),
      }));

      res.json({
        items: formattedItems,
        total,
        hasMore: total > skip + items.length,
      });
    } catch (error) {
      console.error('Get category items error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getLatestItems(req: Request, res: Response) {
    console.log('getLatestItems');

    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 12;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.item.findMany({
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
          select: {
            id: true,
            title: true,
            description: true,
            startPrice: true,
            currentBid: true,
            retailPrice: true,
            imageUrl: true,
            endTime: true,
            categories: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        prisma.item.count(),
      ]);

      const formattedItems = items.map((item: Item) => ({
        ...item,
        startPrice: Number(item.startPrice),
        currentBid: item.currentBid ? Number(item.currentBid) : null,
        retailPrice: Number(item.retailPrice),
      }));

      return res.json({
        items: formattedItems,
        total,
        hasMore: total > skip + items.length,
      });
    } catch (error) {
      console.error('Get latest items error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getItem(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Valid item ID is required' });
      }

      const itemId = parseInt(id, 10); // Explicitly parse as base 10 integer

      const item = await prisma.item.findUnique({
        where: {
          id: itemId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          startPrice: true,
          currentBid: true,
          retailPrice: true,
          imageUrl: true,
          endTime: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Convert Decimal to number for JSON response
      const formattedItem = {
        ...item,
        startPrice: Number(item.startPrice),
        currentBid: item.currentBid ? Number(item.currentBid) : null,
        retailPrice: Number(item.retailPrice),
      };

      return res.json(formattedItem);
    } catch (error) {
      console.error('Get item error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
