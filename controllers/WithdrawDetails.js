import mySqlPool from "../config/db.js";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../middleware/encryptDecrypt.js";
dotenv.config(); // Load environment variables

// Function to encrypt withdraw modes data
const encryptWithdrawData = (withdrawData) => {
  return {
    account_holder_name: withdrawData.account_holder_name ? encrypt(withdrawData.account_holder_name) : null,
    account_number: withdrawData.account_number ? encrypt(withdrawData.account_number) : null,
    ifsc_code: withdrawData.ifsc_code ? encrypt(withdrawData.ifsc_code) : null,
    bic_swift_code: withdrawData.bic_swift_code ? encrypt(withdrawData.bic_swift_code) : null,
    branch: withdrawData.branch ? encrypt(withdrawData.branch) : null,
    bank_account_currency: withdrawData.bank_account_currency ? encrypt(withdrawData.bank_account_currency) : null,
    upi_address: withdrawData.upi_address ? encrypt(withdrawData.upi_address) : null,
    btc_withdraw_address: withdrawData.btc_withdraw_address ? encrypt(withdrawData.btc_withdraw_address) : null,
    eth_withdraw_address: withdrawData.eth_withdraw_address ? encrypt(withdrawData.eth_withdraw_address) : null,
    netteller_address: withdrawData.netteller_address ? encrypt(withdrawData.netteller_address) : null,
  };
};

// Function to decrypt withdraw modes data
const decryptWithdrawData = (encryptedData) => {
  return {
    account_holder_name: encryptedData.account_holder_name ? decrypt(encryptedData.account_holder_name) : null,
    account_number: encryptedData.account_number ? decrypt(encryptedData.account_number) : null,
    ifsc_code: encryptedData.ifsc_code ? decrypt(encryptedData.ifsc_code) : null,
    bic_swift_code: encryptedData.bic_swift_code ? decrypt(encryptedData.bic_swift_code) : null,
    branch: encryptedData.branch ? decrypt(encryptedData.branch) : null,
    bank_account_currency: encryptedData.bank_account_currency ? decrypt(encryptedData.bank_account_currency) : null,
    upi_address: encryptedData.upi_address ? decrypt(encryptedData.upi_address) : null,
    btc_withdraw_address: encryptedData.btc_withdraw_address ? decrypt(encryptedData.btc_withdraw_address) : null,
    eth_withdraw_address: encryptedData.eth_withdraw_address ? decrypt(encryptedData.eth_withdraw_address) : null,
    netteller_address: encryptedData.netteller_address ? decrypt(encryptedData.netteller_address) : null,
  };
};

const submitWithdrawDetails = async (req, res) => {
  try {
    const { AccountID, withdrawData } = req.body; // Get AccountID and withdraw data from request body

    // Encrypt withdraw mode data
    const encryptedWithdrawData = encryptWithdrawData(withdrawData);

    // Insert encrypted data into the database
    const [result] = await mySqlPool.query(
      `INSERT INTO withdraw_modes (AccountID, account_holder_name, account_number, ifsc_code, bic_swift_code, branch, 
        bank_account_currency, upi_address, btc_withdraw_address, eth_withdraw_address, netteller_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        AccountID, // Using AccountID as the identifier
        encryptedWithdrawData.account_holder_name,
        encryptedWithdrawData.account_number,
        encryptedWithdrawData.ifsc_code,
        encryptedWithdrawData.bic_swift_code,
        encryptedWithdrawData.branch,
        encryptedWithdrawData.bank_account_currency,
        encryptedWithdrawData.upi_address,
        encryptedWithdrawData.btc_withdraw_address,
        encryptedWithdrawData.eth_withdraw_address,
        encryptedWithdrawData.netteller_address,
      ]
    );

    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Withdraw details submitted successfully" });
    } else {
      return res.status(500).json({ message: "Failed to submit withdraw details" });
    }
  } catch (error) {
    console.error("Error during withdraw submission:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const updateWithdrawDetails = async (req, res) => {
  try {
    const { AccountID, withdrawData } = req.body; // Get AccountID and updated withdraw data from request body

    // Encrypt the updated withdraw data
    const encryptedWithdrawData = encryptWithdrawData(withdrawData);

    // Update the withdraw details in the database using AccountID
    const [result] = await mySqlPool.query(
      `UPDATE withdraw_modes 
       SET account_holder_name = ?, account_number = ?, ifsc_code = ?, bic_swift_code = ?, branch = ?, 
           bank_account_currency = ?, upi_address = ?, btc_withdraw_address = ?, eth_withdraw_address = ?, 
           netteller_address = ?
       WHERE AccountID = ?`,
      [
        encryptedWithdrawData.account_holder_name,
        encryptedWithdrawData.account_number,
        encryptedWithdrawData.ifsc_code,
        encryptedWithdrawData.bic_swift_code,
        encryptedWithdrawData.branch,
        encryptedWithdrawData.bank_account_currency,
        encryptedWithdrawData.upi_address,
        encryptedWithdrawData.btc_withdraw_address,
        encryptedWithdrawData.eth_withdraw_address,
        encryptedWithdrawData.netteller_address,
        AccountID, 
      ]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Withdraw details updated successfully" });
    } else {
      return res.status(404).json({ message: "Withdraw details not found for this AccountID" });
    }
  } catch (error) {
    console.error("Error during withdraw update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getWithdrawDetails = async (req, res) => {
  try {
    const { AccountID } = req.params; // Get AccountID from request params

    // Query the database for the withdraw details of the given AccountID
    const [result] = await mySqlPool.query(
      `SELECT * FROM withdraw_modes WHERE AccountID = ?`,
      [AccountID] // Use AccountID as a key to fetch withdraw details
    );

    // If no withdraw details are found
    if (result.length === 0) {
      return res.status(404).json({ message: "No withdraw details found for this AccountID" });
    }

    // Decrypt the withdraw details
    const withdrawData = result[0]; // Assuming we're retrieving a single record
    
    const decryptedWithdrawData = decryptWithdrawData({
      account_holder_name: withdrawData.account_holder_name,
      account_number: withdrawData.account_number,
      ifsc_code: withdrawData.ifsc_code,
      bic_swift_code: withdrawData.bic_swift_code,
      branch: withdrawData.branch,
      bank_account_currency: withdrawData.bank_account_currency,
      upi_address: withdrawData.upi_address,
      btc_withdraw_address: withdrawData.btc_withdraw_address,
      eth_withdraw_address: withdrawData.eth_withdraw_address,
      netteller_address: withdrawData.netteller_address,
      // amount: withdrawData.amount, // Amount is not encrypted
    });

    // Return the decrypted withdraw data to the client
    return res.status(200).json({
      message: "Withdraw details fetched successfully",
      data: decryptedWithdrawData,
    });
  } catch (error) {
    console.error("Error fetching withdraw details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export { submitWithdrawDetails, updateWithdrawDetails, getWithdrawDetails };
