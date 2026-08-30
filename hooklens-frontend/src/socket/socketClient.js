import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api/v1';
  return envUrl.replace(/\/api\/v1\/?$/, '');
};

export const connectSocket = (token) => {
  const authToken = token || localStorage.getItem('hooklens_token');
  if (!authToken) {
    console.warn('[Socket] Connection skipped: No JWT token found');
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  const socketUrl = getSocketUrl();
  console.log(`[Socket] Connecting to ${socketUrl}...`);

  socket = io(socketUrl, {
    auth: { token: authToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log(`⚡ [Socket] Real-time connected cleanly (ID: ${socket.id})`);
  });

  socket.on('connect_error', (err) => {
    console.warn(`⚠️ [Socket] Connection error: ${err.message}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 [Socket] Disconnected: ${reason}`);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('hooklens_token');
    if (token) return connectSocket(token);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 [Socket] Disconnecting session');
    socket.disconnect();
    socket = null;
  }
};

export default { connectSocket, getSocket, disconnectSocket };
