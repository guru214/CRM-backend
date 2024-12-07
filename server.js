import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import AuthRoutes from './routes/User.js';
import WithdrawDetails from './routes/WithdrawDetails.js';
import ReqWithdraw from './routes/ReqWithdraw.js';
import ReqDeposit from './routes/ReqDeposit.js';
import cookieParser from 'cookie-parser';
import Refresh from './routes/refreshToken.js';

const app = express();

dotenv.config();
const PORT = process.env.PORT || 4040;

// Middlewares
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1', Refresh);
app.use('/api/v1/withdraw', WithdrawDetails);
app.use('/api/v1/withdraw', ReqWithdraw);
app.use('/api/v1/deposit', ReqDeposit);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send({ message: "Something went wrong!" });
    });

    // Listen to the server after DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process if connection fails
  }
};

// Call the connectDB function to establish the database connection
connectDB();
