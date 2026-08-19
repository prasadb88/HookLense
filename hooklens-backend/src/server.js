import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/Db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// MongoDB Connect & Launch Engine
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Ingestion Gateway running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1);
    });