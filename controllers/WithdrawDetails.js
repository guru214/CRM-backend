import mongoose from "mongoose";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../middleware/encryptDecrypt.js";

dotenv.config(); // Load environment variables

// Withdraw Mode Schema
const WithdrawModeSchema = new mongoose.Schema({
  AccountID: { type: String, required: true, ref: 'User' },
  account_holder_name: { type: String },
  account_number: { type: String },
  ifsc_code: { type: String },
  bic_swift_code: { type: String },
  branch: { type: String },
  bank_account_currency: { type: String },
  upi_address: { type: String },
  btc_withdraw_address: { type: String },
  eth_withdraw_address: { type: String },
  netteller_address: { type: String },
});

const WithdrawMode = mongoose.model("WithdrawMode", WithdrawModeSchema);

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

// Submit Withdraw Details
const submitWithdrawDetails = async (req, res) => {
  try {
    const { AccountID, withdrawData } = req.body;

    // Encrypt withdraw data
    const encryptedWithdrawData = encryptWithdrawData(withdrawData);

    // Create and save new withdraw mode record
    const newWithdrawMode = new WithdrawMode({
      AccountID,
      ...encryptedWithdrawData,
    });

    await newWithdrawMode.save();

    return res.status(201).json({ message: "Withdraw details submitted successfully" });
  } catch (error) {
    console.error("Error during withdraw submission:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update Withdraw Details
const updateWithdrawDetails = async (req, res) => {
  try {
    const { AccountID, withdrawData } = req.body;

    // Encrypt the updated withdraw data
    const encryptedWithdrawData = encryptWithdrawData(withdrawData);

    // Find and update the withdraw details
    const updatedWithdrawMode = await WithdrawMode.findOneAndUpdate(
      { AccountID },
      { ...encryptedWithdrawData },
      { new: true } // Return the updated document
    );

    if (!updatedWithdrawMode) {
      return res.status(404).json({ message: "Withdraw details not found for this AccountID" });
    }

    return res.status(200).json({ message: "Withdraw details updated successfully" });
  } catch (error) {
    console.error("Error during withdraw update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get Withdraw Details
const getWithdrawDetails = async (req, res) => {
  try {
    const { AccountID } = req.params;

    // Find withdraw details by AccountID
    const withdrawData = await WithdrawMode.findOne({ AccountID });

    if (!withdrawData) {
      return res.status(404).json({ message: "No withdraw details found for this AccountID" });
    }

    // Decrypt the withdraw details
    const decryptedWithdrawData = decryptWithdrawData(withdrawData.toObject());

    return res.status(200).json({
      message: "Withdraw details fetched successfully",
      data: decryptedWithdrawData,
    });
  } catch (error) {
    console.error("Error fetching withdraw details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { WithdrawMode, submitWithdrawDetails, updateWithdrawDetails, getWithdrawDetails };
 
