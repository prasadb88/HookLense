import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT Middleware for Socket Connections
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const secret = process.env.JWT_SECRET || 'hooklens_jwt_super_secret_key_prod_2026';
      const decoded = jwt.verify(token, secret);

      socket.userId = decoded.userId || decoded.id;
      socket.tenantId = decoded.tenantId;

      if (!socket.tenantId) {
        return next(new Error('Authentication error: Invalid tenant ID'));
      }

      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const tenantRoom = `tenant:${socket.tenantId}`;
    socket.join(tenantRoom);
    console.log(`⚡ Socket connected: ${socket.id} | User: ${socket.userId} | Joined Room: ${tenantRoom}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });
  });

  console.log('✅ Socket.IO Server Initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('⚠️ Socket.IO not initialized yet');
  }
  return io;
};

export const emitToTenant = (tenantId, eventName, payload) => {
  if (!io) return;
  if (!tenantId) return;
  const room = `tenant:${tenantId.toString()}`;
  io.to(room).emit(eventName, payload);
};
