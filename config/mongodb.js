import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL; // Access the MONGO_URL from .env
    console.log(`Connecting to MongoDB at ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process if connection fails
  }
};

// Handle application shutdown gracefully
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed!");
  } catch (err) {
    console.error("Error closing MongoDB connection:", err.message);
  }
};

export { connectDB, closeDB };
