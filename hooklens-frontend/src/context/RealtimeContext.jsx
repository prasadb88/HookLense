import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [realtimeEvents, setRealtimeEvents] = useState([]);

  const addToast = (title, description, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://127.0.0.1:5000';
    let socketIo = null;

    try {
      socketIo = io(wsUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        autoConnect: true,
      });

      socketIo.on('connect', () => {
        console.log('[HookLens WS] Connected to gateway');
      });

      const handleWebhookReceived = (data) => {
        addToast('New webhook received', `${data.eventType || 'event'} • ${data.provider || 'Webhook'}`, 'info');
        setRealtimeEvents((prev) => [data, ...prev.slice(0, 19)]);
      };

      const handleDeliverySucceeded = (data) => {
        addToast('Delivery Succeeded', `${data.eventType || 'event'} delivered (HTTP ${data.httpStatus || 200})`, 'success');
      };

      const handleDeliveryFailed = (data) => {
        addToast('Delivery Failed', `${data.eventType || 'event'} failed (${data.httpStatus ? `HTTP ${data.httpStatus}` : 'Error'})`, 'error');
      };

      const handleReplayCompleted = (data) => {
        if (data.status === 'SUCCESS') {
          addToast('Replay Completed', `Event ${data.id?.substring(0, 8) || ''} delivered successfully (HTTP ${data.httpStatus || 200})`, 'success');
        } else {
          addToast('Replay Delivery Failed', `Event ${data.id?.substring(0, 8) || ''} failed (${data.httpStatus ? `HTTP ${data.httpStatus}` : 'Error'})`, 'error');
        }
      };

      socketIo.on('webhook:received', handleWebhookReceived);
      socketIo.on('webhook.received', handleWebhookReceived);

      socketIo.on('delivery:success', handleDeliverySucceeded);
      socketIo.on('delivery.succeeded', handleDeliverySucceeded);

      socketIo.on('delivery:failed', handleDeliveryFailed);
      socketIo.on('delivery.failed', handleDeliveryFailed);

      socketIo.on('replay.completed', handleReplayCompleted);

      setSocket(socketIo);
    } catch {
      // WS connection fallback
    }

    return () => {
      if (socketIo) socketIo.disconnect();
    };
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        socket,
        toasts,
        addToast,
        removeToast,
        realtimeEvents,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const useRealtimeEvents = useRealtime;

