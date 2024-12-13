import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    
    const mongoURI = process.env.MONGO_URL; // Access the MONGO_URL from .env
    console.log(mongoURI)
   

    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process if connection fails
  }
};

const closeDB = async() =>{
  try{
    mongoose.connection.close();
    console.log("mongo connection closed!")
  }
  catch(err){
    console.error("error closing the mongoDB:", err.message);
  }
}
export { connectDB, closeDB};

 