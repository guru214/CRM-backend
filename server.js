import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import AuthRoutes from './routes/UserRoutes.js';
import WithdrawDetails from './routes/WithdrawDetailsRoutes.js';
import ReqWithdraw from './routes/ReqWithdrawRoutes.js';
import ReqDeposit from './routes/ReqDepositRoutes.js';
import UserProof from './routes/userProofRoutes.js';
import cookieParser from 'cookie-parser';
import { sequelize } from './config/sqlconnection.js';
import Refresh from './routes/refreshTokenRoute.js';
import cors from 'cors';
import { openSequelizeConnection, closeSequelizeConnection} from './config/sqldb.js'
const app = express();
dotenv.config();
const PORT =  process.env.PORT || 4040;

// Middlewares
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://localhost:3000'); // Allow the frontend origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials (cookies) to be sent
  next();
});


app.use(openSequelizeConnection); 
app.use(closeSequelizeConnection); // Close connection middleware

// Routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1', Refresh);
app.use('/api/v1/withdrawDetails', WithdrawDetails);
app.use('/api/v1/withdraw', ReqWithdraw);
app.use('/api/v1/deposit', ReqDeposit);
app.use('/api/v1/userProof', UserProof);

app.get('/', (req,res)=>{
   res.json("This is the basic api")
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});
   
// Listen to the server after DB connection
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
