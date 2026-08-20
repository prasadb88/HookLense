import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/Db.js';

import './workers/delivery.worker.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 HookLens Gateway running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1);
    });