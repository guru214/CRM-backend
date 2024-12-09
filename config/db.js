import mysql from 'mysql2/promise';

const mySqlPool = mysql.createPool({
  host: 'localhost',          // Your MySQL host
  user: 'root',          // Your MySQL user
  // password: 'Npminit@12', //anwaar
  // password: 'SHA#1113#sha',  //sohail
  password:'Sainaidu#2000', //Sailakshmi
  // database: 'server_crm', //anwaar
  database: 'bank_transfer',//sailakshmi
  // port: 3300 ,//anwar
  port:3306 ,//sailakshmi
  // port: 5000 ,//sohail
});

export default mySqlPool;
