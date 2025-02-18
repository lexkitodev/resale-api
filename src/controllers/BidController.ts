import { Server, Socket } from 'socket.io';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class BidController {
  static initialize(io: Server) {
    console.log('BidController initialized');

    io.on('connection', (socket: Socket) => {
      console.log('Socket connected:', {
        socketId: socket.id,
        userId: socket.data.userId,
        authenticated: !!socket.data.userId,
      });

      socket.on('placeBid', async (data: { itemId: number; amount: number }) => {
        console.log('Bid attempt received:', {
          socketId: socket.id,
          userId: socket.data.userId,
          data,
        });

        try {
          if (!socket.data.userId) {
            console.log('Bid rejected: Not authenticated');
            throw new Error('Not authenticated');
          }

          const item = await prisma.item.findUnique({
            where: { id: data.itemId },
          });
          console.log('Item found:', item);

          // Validate the bid
          if (!item) {
            throw new Error('Item not found');
          }

          // Create bid using transaction to ensure consistency
          const [bid, updatedItem] = await prisma.$transaction([
            prisma.bid.create({
              data: {
                itemId: data.itemId,
                amount: new Prisma.Decimal(data.amount),
                userId: socket.data.userId,
              },
            }),
            prisma.item.update({
              where: { id: data.itemId },
              data: { currentBid: new Prisma.Decimal(data.amount) },
            }),
          ]);
          console.log('Bid created:', { bid, updatedItem });

          const totalBids = await prisma.bid.count({ where: { itemId: data.itemId } });
          console.log('Total bids:', totalBids);

          // Broadcast to all clients
          io.emit('bidUpdate', {
            itemId: data.itemId,
            currentBid: data.amount,
            totalBids,
          });
          console.log('Bid update emitted to all clients');

          socket.emit('bidSuccess');
          console.log('Bid success emitted to bidder');
        } catch (error) {
          console.error('Bid error:', {
            error,
            socketId: socket.id,
            userId: socket.data.userId,
            data,
          });
          socket.emit('bidError', {
            message: error instanceof Error ? error.message : 'Failed to place bid',
          });
        }
      });

      socket.on('subscribeToBids', (itemId: number) => {
        console.log('Client subscribed to bids:', {
          socketId: socket.id,
          itemId,
        });
        socket.join(`item:${itemId}`);
      });

      socket.on('unsubscribeFromBids', (itemId: number) => {
        socket.leave(`item:${itemId}`);
      });
    });
  }
}
