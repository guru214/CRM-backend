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
import https from 'https';
import fs from 'fs';
import { openSequelizeConnection, closeSequelizeConnection} from './config/sqldb.js'
import { connectDB, closeDB } from './config/mongodb.js';

const app = express();
dotenv.config();
const port =  process.env.PORT || 4040;

// Reading certificates
const options = {
  key: fs.readFileSync('./certs/localhost-key.pem'),
  cert: fs.readFileSync('./certs/localhost.pem')
};

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

connectDB();

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

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

// Creating HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running at https://localhost:${port}`);
});
