const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL; // Access the MONGO_URL from .env
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process if connection fails
  }
};

module.exports = connectDB;

