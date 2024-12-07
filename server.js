import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import sequelize from './config/db.js';  // Import the Sequelize instance
import AuthRoutes from './routes/User.js';
import WithdrawDetails from './routes/WithdrawDetails.js';
import ReqWithdraw from './routes/ReqWithdraw.js';
import ReqDeposit from './routes/ReqDeposit.js';
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



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});