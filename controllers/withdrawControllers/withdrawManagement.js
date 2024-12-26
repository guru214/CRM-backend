import { connectDB, closeDB } from "../../config/mongodb.js";
import withdrawRequest from "../../models/withdrawRequestModel.js";
import { encrypt, decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
import fs from "fs";
import User from "../../models/User.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
import { closeConnection, openConnection } from "../../config/sqlconnection.js";

const ChangeWithdrawStatus = async (req, res) => {
    try {
      await openConnection();
      await connectDB();
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
      await closeDB();
    }
  };
  
  

export { ChangeWithdrawStatus };