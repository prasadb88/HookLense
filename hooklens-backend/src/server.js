import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import connectDB from './db/Db.js';
import { initSocketServer } from './socket/socket.js';

import './workers/delivery.worker.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO with HTTP server
initSocketServer(server);

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 HookLens Gateway running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1);
    });