
import dotenv from "dotenv";
dotenv.config();
console.log("MongoDB URI:", process.env.MONGO_URI); // Debugging step
import mongoose from "mongoose";

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("MongoDB connection error:", err));
  };

export default connectDB;