// //transaction.js
// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');
// const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique IDs

// router.post('/transfer', (req, res) => {
//     const {
//         Bank_name,
//         Account_number,
//         Account_holder_name,
//         Account_type,
//         Ifsc_code,
//         Branch_name
//     } = req.body;

//     // Input validation
//     if (!Bank_name || !Account_number || !Account_holder_name || !Ifsc_code || !Branch_name) {
//         return res.status(400).send({ error: 'All fields are required' });
//     }

//     // Generate a unique ID for the transaction
//     const transactionId = uuidv4();    // Define the transaction object
//     const accountDetails = {
//         Id: transactionId, // Include the generated ID
//         Bank_name,
//         Account_number,
//         Account_holder_name,
//         Account_type: Account_type || 'Savings', // Default Account Type if not provided
//         Ifsc_code,
//         Branch_name
//     };

//     // Insert transaction into the database
   
//       const sql = 'INSERT INTO transactions SET ?';
//      db.query(sql, accountDetails, (err, result) => { // Use accountDetails here
//     if (err) {
//         console.error('Error inserting data:', err);
//         return res.status(500).json({ message: 'Database error', error: err });
//     }

//     res.status(201).json({
//         message: 'Transaction created successfully',
//         transactionId: transactionId // Return the generated ID
//     });
// });

// });



// module.exports = router;

// //withdraws
// const express = require('express');
// const bodyParser = require('body-parser');
// const mysql = require('mysql2');

// const app = express();
// const port = 3030;

// // Middleware
// app.use(bodyParser.json());

// // Database connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root', // Replace with your MySQL username
//     password: 'Sainaidu#2000', // Replace with your MySQL password
//     database: 'bank_transfer',
// });

// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//         process.exit(1);
//     }
//     console.log('Connected to the database.');
// });

// // Start the server
// app.listen(3030, () => {
//     console.log('Server is running on http://localhost:3030');
//   });
  
// // Withdrawal API endpoint
// app.post('/withdraw', (req, res) => {
//     const {
//         account_holder_name,
//         account_number,
//         ifsc_code,
//         bic_swift_code,
//         branch,
//         bank_account_currency,
//         upi_address,
//         btc_withdraw_address,
//         eth_withdraw_address,
//         netteller_address,
//         amount,
//     } = req.body;

//     // Basic validation
//     if (!account_holder_name || !account_number || !amount) {
//         return res.status(400).json({ error: 'Required fields are missing.' });
//     }

//     const sql = `INSERT INTO withdrawals (
//         account_holder_name, account_number, ifsc_code, bic_swift_code, branch,
//         bank_account_currency, upi_address, btc_withdraw_address, eth_withdraw_address,
//         netteller_address, amount
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const values = [
//         account_holder_name,
//         account_number,
//         ifsc_code || null,
//         bic_swift_code || null,
//         branch || null,
//         bank_account_currency || null,
//         upi_address || null,
//         btc_withdraw_address || null,
//         eth_withdraw_address || null,
//         netteller_address || null,
//         amount,
//     ];

//     db.query(sql, values, (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//         res.status(201).json({ message: 'Withdrawal recorded successfully', withdrawalId: result.insertId });
//     });
// });

// //payments
// const express = require('express');
// const mysql = require('mysql2');
// const multer = require('multer');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// // Set up the uploads directory
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage });

// // Database connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root', // Replace with your MySQL username
//     password: 'Sainaidu#2000', // Replace with your MySQL password
//     database: 'bank_transfer'
// });
// db.connect(err => {
//     if (err) throw err;
//     console.log('Connected to MySQL');
// });

// // Endpoint to upload payment proof and save data
// app.post('/api/payments', upload.single('file'), (req, res) => {
//     const { mode_of_payment, deposit_amount } = req.body;
//     if (!req.file) {
//         return res.status(400).json({ error: 'File is required' });
//     }
//     const filePath = req.file.path;
//     const sql = 'INSERT INTO payments (mode_of_payment, deposit_amount, file_path) VALUES (?, ?, ?)';
//     db.query(sql, [mode_of_payment, deposit_amount, filePath], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.status(201).json({ message: 'Payment added successfully', paymentId: result.insertId });
//     });
// });

// // Endpoint to fetch payment history
// app.get('/api/payments', (req, res) => {
//     const sql = 'SELECT * FROM payments ORDER BY created_at DESC';
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.status(200).json(results);
//     });
// });


// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

// //payouts

// const express = require('express');
// const bodyParser = require('body-parser');
// const db = require('./db'); // Import the database connection

// const app = express();
// app.use(bodyParser.json()); // Parse JSON requests

// // Endpoint to request a payment
// app.post('/api/request-payment', (req, res) => {
//     const { mode_of_payment, amount } = req.body;

//     if (!mode_of_payment || !amount) {
//         return res.status(400).json({ error: 'Mode of payment and amount are required' });
//     }

//     const sql = 'INSERT INTO payouts (mode_of_payment, amount) VALUES (?, ?)';
//     db.query(sql, [mode_of_payment, amount], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.status(201).json({ message: 'Payment request submitted successfully', requestId: result.insertId });
//     });
// });

// // Endpoint to get payout history
// app.get('/api/payout-history', (req, res) => {
//     const sql = 'SELECT id, created_at AS time, amount, mode_of_payment AS method, status, detail FROM payouts ORDER BY created_at DESC';
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.status(200).json(results);
//     });
// });

// // Server initialization
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });



