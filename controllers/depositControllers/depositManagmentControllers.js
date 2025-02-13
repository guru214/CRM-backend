import { connectDB, closeDB } from "../../config/mongodb.js";
import DepositRequest from "../../models/DepositRequest.js";
import { encrypt, decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
import fs from "fs";
import User from "../../models/User.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
import { closeConnection, openConnection } from "../../config/sqlconnection.js";

const ChangeDepositStatus = async (req, res) => {
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
  
      // Retrieve the current deposit request
      const currentDepositRequest = await DepositRequest.findOne({ AccountID: AccountID, _id: id });
      if (!currentDepositRequest) {
        return res.status(404).json({ message: "Deposit request not found." });
      }
  
      // Check if the status is already final
      if (['Approved', 'Declined'].includes(currentDepositRequest.status)) {
        return res.status(400).json({ message: `Cannot update an already ${currentDepositRequest.status.toLowerCase()} request.` });
      }
  
      // Update the deposit status
      const depositData = await DepositRequest.updateOne(
        { AccountID: AccountID, _id: id },
        { $set: { status: status } }
      );
  
      if (depositData.nModified === 0) {
        return res.status(404).json({ message: "No changes made to the deposit request." });
      }
  
      // Handle the status 'Approved'
      if (status === "Approved") {
        const user = await User.findOne({ AccountID: AccountID });
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
  
        // Decrypt the user's existing amount, update it, and encrypt the new amount
        const existingUserAmount = parseFloat(decrypt(user.amount));
        // console.log(existingUserAmount);
        const depositedAmount = parseFloat(decrypt(currentDepositRequest.amount));
        // console.log(depositedAmount);
        const updatedAmount = existingUserAmount + depositedAmount;
        // console.log(updatedAmount);
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
      console.error("Error updating deposit status:", error);
      return res.status(500).json({ message: "Internal server error." });
    } finally {
      await closeConnection();
      // await closeDB();
    }
  };
  
  
  const GetAllDepositRequests = async (req, res) => {
    try {
      await openConnection();
      // await connectDB();
      
      // Retrieve all deposit requests
      const depositRequests = await DepositRequest.find({});
      
      // Check if there are no deposit requests
      if (!depositRequests || depositRequests.length === 0) {
        return res.status(404).json({ message: "No deposit requests found." });
      }
  
      // Decrypt withdraw_mode and amount for each request
      const decryptedDepositRequests = depositRequests.map((request) => {
        return {
          ...request.toObject(), // Convert the mongoose document to a plain object
          deposit_mode: decrypt(request.deposit_mode),
          image_proof: decrypt(request.image_proof),
          amount: decrypt(request.amount), // Decrypt the amount
        };
      });
  
      return res.status(200).json({ depositRequests: decryptedDepositRequests });
    } catch (error) {
      console.error("Error fetching deposit requests:", error);
      return res.status(500).json({ message: "Internal server error." });
    } finally {
      await closeConnection();
      // await closeDB();
    }
  };
  const GetApprovedDepositRequestsAndTotalInvestment = async (req, res) => {
    try {
      await openConnection();
  
      // Retrieve approved deposit requests
      const approvedRequests = await DepositRequest.find({ status: "Approved" });
  
      // Check if there are no approved deposit requests
      if (!approvedRequests || approvedRequests.length === 0) {
        return res.status(404).json({ message: "No approved deposit requests found." });
      }
  
      // Group approved requests by user and calculate the total investment amount per user
      const userInvestments = {};
  
      approvedRequests.forEach((request) => {
        const AccountID = request.AccountID;
  
        if (!userInvestments[AccountID]) {
          userInvestments[AccountID] = {
            AccountID: AccountID,
            total_investment: 0,
          };
        }
  
        // Add the decrypted amount to the total investment for this user
        userInvestments[AccountID].total_investment += parseFloat(decrypt(request.amount));
      });
  
      // Convert the grouped data to an array with only AccountID and total_investment
      const result = Object.values(userInvestments).map(({ AccountID, total_investment }) => ({
        AccountID,
        total_investment,
      }));
  
      return res.status(200).json({ userInvestments: result });
    } catch (error) {
      console.error("Error fetching approved deposit requests:", error);
      return res.status(500).json({ message: "Internal server error." });
    } finally {
      await closeConnection();
    }
  };
  
  
  
  export { GetAllDepositRequests, GetApprovedDepositRequestsAndTotalInvestment, ChangeDepositStatus };