import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface JwtPayloadWithUser extends jwt.JwtPayload {
  userId: number;
}

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;
  console.log('Socket auth attempt:', {
    socketId: socket.id,
    hasToken: !!token,
  });

  if (!token) {
    console.log('Socket auth failed: No token');
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayloadWithUser;
    socket.data.userId = decoded.userId;
    console.log('Socket authenticated:', {
      socketId: socket.id,
      userId: decoded.userId,
    });
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication error'));
  }
};
