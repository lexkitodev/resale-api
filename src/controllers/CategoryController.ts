import { Request, Response } from 'express';
import prisma from '../lib/prisma';

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
      const formattedItems = items.map((item) => ({
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
          },
        }),
        prisma.item.count(),
      ]);

      const formattedItems = items.map((item) => ({
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
      console.error('Get latest items error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
