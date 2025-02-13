import { connectDB, closeDB } from "../../config/mongodb.js";
import withdrawRequest from "../../models/withdrawRequestModel.js";
import { encrypt, decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
import fs from "fs";
import User from "../../models/User.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
import { closeConnection, openConnection } from "../../config/sqlconnection.js";
import WithdrawMode from "../../models/WithdrawModeModel.js";


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

const ChangeWithdrawStatus = async (req, res) => {
    try {
      await openConnection();
      // await connectDB();
      const { AccountID, id, status } = req.body;
  
      // Check for missing fields
      if (!AccountID || !id || !status) {
        return res.status(400).json({ message: "Missing fields required." });
      }
  
      // Validate status value
      if (!['Pending', 'Approved', 'Declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
      }
  
      // Retrieve the current withdraw request
      const currentWithdrawRequest = await withdrawRequest.findOne({ AccountID: AccountID, _id: id });
      if (!currentWithdrawRequest) {
        return res.status(404).json({ message: "Withdraw request not found." });
      }
  
      // Check if the status is already final
      if (['Approved', 'Declined'].includes(currentWithdrawRequest.status)) {
        return res.status(400).json({ message: `Cannot update an already ${currentWithdrawRequest.status.toLowerCase()} request.` });
      }
  
      // Update the withdraw status
      const withdrawData = await withdrawRequest.updateOne(
        { AccountID: AccountID, _id: id },
        { $set: { status: status } }
      );
  
      if (withdrawData.nModified === 0) {
        return res.status(404).json({ message: "No changes made to the withdraw request." });
      }
  
      // Handle the status 'Approved'
      if (status === "Approved") {
        const user = await User.findOne({ AccountID: AccountID });
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
  
        // Decrypt the user's existing amount, update it, and encrypt the new amount
        const existingUserAmount = parseFloat(decrypt(user.amount));
        console.log(existingUserAmount);
        const withdrawedAmount = parseFloat(decrypt(currentWithdrawRequest.amount));
        console.log(withdrawedAmount);
        const updatedAmount = existingUserAmount - withdrawedAmount;
        console.log(updatedAmount);
        user.amount = encrypt(updatedAmount.toString());
  
        // Save the updated user amount
        await user.save();
  
        return res.status(200).json({ message: "Status changed to 'Approved' and amount updated successfully." });
      }
  
      // Handle the status 'Declined'
      if (status === "Declined") {
        return res.status(200).json({ message: "Your request has been declined." });
      }
  
      // Handle the status 'Pending' or any other future statuses
      return res.status(200).json({ message: "Status changed successfully." });
  
    } catch (error) {
      console.error("Error updating withdraw status:", error);
      return res.status(500).json({ message: "Internal server error." });
    } finally {
      await closeConnection();
      // await closeDB();
    }
  };
  const GetAllWithdrawRequests = async (req, res) => {
    try {
      await openConnection();
      // await connectDB();
      
      // Retrieve all withdraw requests
      const withdrawRequests = await withdrawRequest.find({});
      
      // Check if there are no withdraw requests
      if (!withdrawRequests || withdrawRequests.length === 0) {
        return res.status(404).json({ message: "No withdraw requests found." });
      }
  
      // Decrypt withdraw_mode and amount for each request
      const decryptedWithdrawRequests = withdrawRequests.map((request) => {
        return {
          ...request.toObject(), // Convert the mongoose document to a plain object
          withdraw_mode: decrypt(request.withdraw_mode),
          amount: decrypt(request.amount)
        };
      });
  
      return res.status(200).json({ withdrawRequests: decryptedWithdrawRequests });
    } catch (error) {
      console.error("Error fetching withdraw requests:", error);
      return res.status(500).json({ message: "Internal server error." });
    } finally {
      await closeConnection();
      // await closeDB();
    }
  };

  const listAllWithdrawRequests = async (req, res) => {
    try {
      // Open database connection
      // await openConnection();
  
      // Retrieve all withdraw requests from the database
      const withdrawModes = await WithdrawMode.find({});
  
      // Log the entire withdrawModes array to inspect the data
      // console.log('Withdraw Modes:', withdrawModes);
  
      // Check if there are no withdraw requests
      if (!withdrawModes || withdrawModes.length === 0) {
        return res.status(404).json({ message: "No withdraw requests found." });
      }
  
      // Decrypt withdraw data for each request
      const decryptedWithdrawModes = withdrawModes.map((request) => {
        // Log the request data to inspect its structure
        // console.log('Request Data:', request);
  
        return {
          AccountID: request.AccountID,
          decryptedData: decryptWithdrawData( request.toObject())
        };
      });
  
      // Log the decrypted withdraw modes
      // console.log('Decrypted Withdraw Modes:', decryptedWithdrawModes);
  
      // Return the decrypted withdraw modes in the response
      return res.status(200).json({ WithdrawData: decryptedWithdrawModes });
    } catch (error) {
      console.error("Error fetching withdraw requests:", error);
      // Return a generic error response
      return res.status(500).json({ message: "Internal server error." });
    } finally {
      // Ensure the database connection is closed
      // await closeConnection();
    }
  };

export { GetAllWithdrawRequests, listAllWithdrawRequests, ChangeWithdrawStatus };