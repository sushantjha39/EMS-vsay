import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection successful!');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

testConnection();
