CREATE DATABASE server_crm;

USE server_crm;

CREATE SCHEMA IF NOT EXISTS server_crm;

CREATE TABLE IF NOT EXISTS server_crm.users (
  id INT NOT NULL AUTO_INCREMENT,
  FullName VARCHAR(600) NOT NULL,
  Email VARCHAR(600) NOT NULL UNIQUE,
  Password VARCHAR(600) NOT NULL,
  Phone VARCHAR(600) NOT NULL,
  Account_Type VARCHAR(600) DEFAULT 'classic' NOT NULL,
  AccountID VARCHAR(600) NOT NULL UNIQUE,
  ReferralID VARCHAR(600) NOT NULL UNIQUE,
  Address VARCHAR(600),
  amount DECIMAL(15, 2) DEFAULT 0.00, 
  token TEXT NULL,
  documentType VARCHAR(600)  DEFAULT 'pending',
  documentNumber VARCHAR(600)  DEFAULT 'pending',
  submissionDate DATETIME,
  KYC_Status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending' NOT NULL,
  refreshToken TEXT NULL,
  PRIMARY KEY (AccountID)
);


CREATE TABLE IF NOT EXISTS server_crm.withdraw_modes (
  id INT NOT NULL AUTO_INCREMENT, 
  AccountID VARCHAR(600) NOT NULL, 
  withdraw_mode ENUM('BANK', 'UPI', 'BTC', 'ETH', 'NETELLER') NOT NULL, 
  account_holder_name VARCHAR(600), 
  account_number VARCHAR(600), 
  ifsc_code VARCHAR(600), 
  bic_swift_code VARCHAR(600), 
  branch VARCHAR(600), 
  bank_account_currency VARCHAR(600),
  upi_address VARCHAR(600), 
  btc_withdraw_address VARCHAR(600), 
  eth_withdraw_address VARCHAR(600), 
  netteller_address VARCHAR(600), 
  amount  DECIMAL(10, 2) NOT NULL, 
  withdraw_date DATETIME DEFAULT CURRENT_TIMESTAMP, 
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending', 
  PRIMARY KEY (id),
  FOREIGN KEY (AccountID) REFERENCES server_crm.users(AccountID) ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS server_crm.withdraw_requests (
    id INT NOT NULL AUTO_INCREMENT,
    AccountID VARCHAR(600) NOT NULL,
    withdraw_mode ENUM('BANK', 'UPI', 'BTC', 'ETH', 'NETELLER')  NOT NULL, -- Reference to withdraw_modes
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_date DATETIME NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (AccountID) REFERENCES server_crm.users(AccountID) ON DELETE CASCADE,
    FOREIGN KEY (withdraw_mode) REFERENCES server_crm.withdraw_modes(withdraw_mode) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deposit_requests (
  id INT NOT NULL AUTO_INCREMENT,
  AccountID VARCHAR(600) NOT NULL,
  Deposit_mode ENUM('Bank Transfer', 'UPI', 'BTC', 'ETH', 'NETELLER') DEFAULT 'Bank Transfer',
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  amount DECIMAL(15, 2) NOT NULL,
  image_proof TEXT, -- Column to store encrypted image proof
  PRIMARY KEY (id),
  FOREIGN KEY (AccountID) REFERENCES server_crm.users(AccountID) ON DELETE CASCADE
);



-- -- Account table to store different currency accounts for each user
-- CREATE TABLE IF NOT EXISTS crm.account_table (
--   account_id INT NOT NULL AUTO_INCREMENT,
--   user_id INT NOT NULL,
--   currency VARCHAR(10) NOT NULL, -- e.g., "USD", "EUR", "BTC"
--   balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
--   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   PRIMARY KEY (account_id),
--   FOREIGN KEY (user_id) REFERENCES crm.user_table(id) ON DELETE CASCADE
-- );

-- -- Transaction table to record deposits, withdrawals, and other transactions
-- CREATE TABLE IF NOT EXISTS crm.transaction_table (
--   transaction_id INT NOT NULL AUTO_INCREMENT,
--   account_id INT NOT NULL,
--   transaction_type ENUM('deposit', 'withdraw') NOT NULL,
--   amount DECIMAL(18, 2) NOT NULL,
--   currency VARCHAR(10) NOT NULL, -- e.g., "USD", "EUR"
--   transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   status ENUM('pending', 'completed', 'failed') DEFAULT 'completed' NOT NULL,
--   PRIMARY KEY (transaction_id),
--   FOREIGN KEY (account_id) REFERENCES crm.account_table(account_id) ON DELETE CASCADE
-- );
-- CREATE DATABASE bank_transfer;
--show databases;
--use bank_transfer;
 --create table transactions ( 
    --id INT AUTO_INCREMENT PRIMARY KEY,
    --Bank_name VARCHAR(255) NOT NULL,
    --Account_number VARCHAR(255) NOT NULL,
    --Account_holder_name VARCHAR(255) NOT NULL,
    --Account_type VARCHAR(50),
    --Ifsc_code VARCHAR(20),
    --Branch_name VARCHAR(255)
--);-ALTER TABLE transactions 
  --  MODIFY Bank_name VARCHAR(600) NOT NULL,
    --MODIFY Account_number VARCHAR(600) NOT NULL,
    --MODIFY Account_holder_name VARCHAR(600) NOT NULL,
    --MODIFY Branch_name VARCHAR(600),
    --MODIFY Account_type VARCHAR(600),
    --MODIFY Ifsc_code VARCHAR(600);

--DESCRIBE transactions;
--SELECT * FROM transactions;
--CREATE TABLE withdrawals (
    --id INT AUTO_INCREMENT PRIMARY KEY,
    --account_holder_name VARCHAR(255) NOT NULL,
    --account_number VARCHAR(50) NOT NULL,
    --ifsc_code VARCHAR(20),
    --bic_swift_code VARCHAR(20),
    --branch VARCHAR(255),
    --bank_account_currency VARCHAR(10),
    --upi_address VARCHAR(255),
    --btc_withdraw_address VARCHAR(255),
    --eth_withdraw_address VARCHAR(255),
    --netteller_address VARCHAR(255),
    --amount DECIMAL(15,2) NOT NULL,
    --created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--);
--ALTER TABLE withdrawals
--MODIFY COLUMN account_holder_name VARCHAR(600),
--MODIFY COLUMN account_number VARCHAR(600),
--MODIFY COLUMN ifsc_code VARCHAR(600),
--MODIFY COLUMN branch VARCHAR(600),
--MODIFY COLUMN bank_account_currency VARCHAR(600),
--MODIFY COLUMN upi_address VARCHAR(600),
--MODIFY COLUMN btc_withdraw_address VARCHAR(600),
--MODIFY COLUMN eth_withdraw_address VARCHAR(600),
--MODIFY COLUMN netteller_address VARCHAR(600);

--DESCRIBE withdrawals;
--SELECT * FROM withdrawals;

--CREATE TABLE payments (
   -- id INT AUTO_INCREMENT PRIMARY KEY,
   -- mode_of_payment VARCHAR(50) NOT NULL,
    --deposit_amount DECIMAL(10, 2) NOT NULL,
    --file_path VARCHAR(255) NOT NULL,
    --created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--);

--DESCRIBE payments;
--SELECT * FROM payments;
--CREATE TABLE payouts (
  --  id INT AUTO_INCREMENT PRIMARY KEY,
    --mode_of_payment VARCHAR(50) NOT NULL,
    --amount DECIMAL(10, 2) NOT NULL,
    --status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    --detail TEXT,
    --created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--);
--DESCRIBE payouts;
--SELECT * FROM payouts;
--ALTER TABLE payouts 
--CHANGE COLUMN created_at time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
--DROP DATABASE IF EXISTS bank_tranfer;









