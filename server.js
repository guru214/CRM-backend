import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mySqlPool from './config/db.js';
import AuthRoutes from './routes/UserRoutes.js';
import WithdrawDetails from './routes/WithdrawDetailsRoutes.js';
import ReqWithdraw from './routes/ReqWithdrawRoutes.js';
import ReqDeposit from './routes/ReqDepositRoutes.js';
import cookieParser from 'cookie-parser';
import Refresh from './routes/refreshTokenRoute.js';
// import logger from './loggers.js/log.js';

const app = express();

dotenv.config();
const PORT = process.env.PORT || 4040

//middlewares
app.use(cookieParser())

app.use(morgan('dev'));
app.use(express.json());


// //routes
// app.get('/test', (req, res) => {
//   res.status(200).send('<h1> HIII </h1>')
// });


app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1', Refresh);
app.use('/api/v1/withdraw', WithdrawDetails);
app.use('/api/v1/withdraw', ReqWithdraw);
app.use('/api/v1/deposit', ReqDeposit);

// app.get('/', async (req, res) => {
//   logger.info("this is info test.");
//   logger.error('error occured!');
// })


// conditionally listen
mySqlPool
  .query('SELECT 1')
  .then(() => {
    // MySql
    console.log('Mysql DB  connected');


    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send({ message: "Something went wrong!" });
    });

    //listen
    app.listen(PORT, () => {
      console.log(`Server is on port ${process.env.PORT}`)
    });
  }).catch(err => {
    console.log(err);
  })

// async function testConnection() {
//   try {
//     const connection = await mySqlPool.getConnection();
//     console.log('Database connected successfully');
//     connection.release(); // Release the connection
//   } catch (error) {
//     console.error('Database connection failed:', error);
//   }
// }

// testConnection();


