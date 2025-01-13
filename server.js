
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import AuthRoutes from './routes/UserRoutes.js';
import WithdrawDetails from './routes/WithdrawDetailsRoutes.js';
import ReqWithdraw from './routes/ReqWithdrawRoutes.js';
import ReqDeposit from './routes/ReqDepositRoutes.js';
import UserProof from './routes/userProofRoutes.js';
import Returns from './routes/ReturnRoutes.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import Refresh from './routes/refreshTokenRoute.js';
import cors from 'cors';
import { openSequelizeConnection, closeSequelizeConnection} from './config/sqldb.js'

const app = express();
dotenv.config();
const port =  process.env.PORT || 4040;

// Middlewares
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: 'https://localhost:3000', // Allow only the frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));


app.use(openSequelizeConnection); 
app.use(closeSequelizeConnection); // Close connection middleware


// MongoDB connection middleware
const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL; // Access the MONGO_URL from .env
    console.log(`Connecting to MongoDB at ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected Successfully!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit the process if connection fails
  }
};

app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('Reconnecting to MongoDB...');
      await connectMongoDB();
    }
    next();
  } catch (error) {
    console.error('Error ensuring MongoDB connection:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

// Routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1', Refresh);
app.use('/api/v1/withdrawDetails', WithdrawDetails);
app.use('/api/v1/withdraw', ReqWithdraw);
app.use('/api/v1/deposit', ReqDeposit);
app.use('/api/v1/userProof', UserProof);
app.use('/api/v1', Returns);

app.get('/', (req,res)=>{
   res.json("This is the basic api")
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});

app.listen(port, () =>{
console.log(`Server is running on ${port}`);
});


// import express from 'express';
// import dotenv from 'dotenv';
// import morgan from 'morgan';
// import AuthRoutes from './routes/UserRoutes.js';
// import WithdrawDetails from './routes/WithdrawDetailsRoutes.js';
// import ReqWithdraw from './routes/ReqWithdrawRoutes.js';
// import ReqDeposit from './routes/ReqDepositRoutes.js';
// import UserProof from './routes/userProofRoutes.js';
// import Returns from './routes/ReturnRoutes.js';
// import cookieParser from 'cookie-parser';
// import mongoose from 'mongoose';
// import Refresh from './routes/refreshTokenRoute.js';
// import cors from 'cors';
// import https from 'https';
// import fs from 'fs';
// import { openSequelizeConnection, closeSequelizeConnection} from './config/sqldb.js'
// // import { connectDB, closeDB } from './config/mongodb.js';

// const app = express();
// dotenv.config();
// const port =  process.env.PORT || 4040;

// // Reading certificates
// const options = {
//   key: fs.readFileSync('./certs/localhost-key.pem'),
//   cert: fs.readFileSync('./certs/localhost.pem')
// };

// // Middlewares
// app.use(cookieParser());
// app.use(morgan('dev'));
// app.use(express.json());

// app.use(cors({
//   origin: 'https://localhost:3000', // Allow only the frontend URL
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//   credentials: true,
// }));


// app.use(openSequelizeConnection); 
// app.use(closeSequelizeConnection); // Close connection middleware

// // MongoDB connection middleware
// const connectMongoDB = async () => {
//   try {
//     const mongoURI = process.env.MONGO_URL; // Access the MONGO_URL from .env
//     console.log(`Connecting to MongoDB at ${mongoURI}`);
//     await mongoose.connect(mongoURI);
//     console.log('MongoDB Connected Successfully!');
//   } catch (err) {
//     console.error('Error connecting to MongoDB:', err.message);
//     process.exit(1); // Exit the process if connection fails
//   }
// };

// app.use(async (req, res, next) => {
//   try {
//     if (mongoose.connection.readyState === 0) {
//       console.log('Reconnecting to MongoDB...');
//       await connectMongoDB();
//     }
//     next();
//   } catch (error) {
//     console.error('Error ensuring MongoDB connection:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// process.on('SIGINT', async () => {
//   console.log('SIGINT received. Closing MongoDB connection...');
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed.');
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received. Closing MongoDB connection...');
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed.');
//   process.exit(0);
// });

// // Routes
// app.use('/api/v1/auth', AuthRoutes);
// app.use('/api/v1', Refresh);
// app.use('/api/v1/withdrawDetails', WithdrawDetails);
// app.use('/api/v1/withdraw', ReqWithdraw);
// app.use('/api/v1/deposit', ReqDeposit);
// app.use('/api/v1/userProof', UserProof);
// app.use('/api/v1', Returns);

// app.get('/', (req,res)=>{
//    res.json("This is the basic api")
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send({ message: "Something went wrong!" });
// });

// // Creating HTTPS server
// https.createServer(options, app).listen(port, () => {
//   console.log(`HTTPS server running at https://localhost:${port}`);
// });

