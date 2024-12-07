import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import AuthRoutes from './routes/UserRoutes.js';
import WithdrawDetails from './routes/WithdrawDetailsRoutes.js';
import ReqWithdraw from './routes/ReqWithdrawRoutes.js';
import ReqDeposit from './routes/ReqDepositRoutes.js';
import cookieParser from 'cookie-parser';
import Refresh from './routes/refreshTokenRoute.js';
// import logger from './loggers.js/log.js';
import cors from 'cors';
import sequelize from './config/db.js';  // Import the Sequelize instance

const app = express();

dotenv.config();
const PORT = process.env.PORT || 4040;

// Middlewares
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // Allow only the frontend URL
  // methods: 'GET, POST, PUT, DELETE',
  credentials: true,
}));

// Routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1', Refresh);
app.use('/api/v1/withdraw', WithdrawDetails);
app.use('/api/v1/withdraw', ReqWithdraw);
app.use('/api/v1/deposit', ReqDeposit);

// Condition to connect to the database and then start the server
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully with Sequelize');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
  sequelize.sync();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process if connection fails
  }
};

// Call the connectDB function to establish the database connection
connectDB();


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});

// Listen to the server after DB connection
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
