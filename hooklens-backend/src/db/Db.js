import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
        if (!mongoUrl) {
            console.error("MONGODB_URL / MONGO_URI is not defined in .env file");
            process.exit(1);
        }

        const connectionInstance = await mongoose.connect(mongoUrl, { dbName: DB_NAME });
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED");
        console.log("Error Name:", error.name);
        console.log("Error Message:", error.message);
        process.exit(1);
    }
}

export default connectDB;