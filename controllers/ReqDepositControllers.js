import mongoose from "mongoose";
import DepositRequest from "../models/DepositRequest.js";


// Submit a new deposit request
const submitDepositRequest = async (req, res) => {
  try {
    const { AccountID, deposit_mode, amount, image_proof } = req.body;

    if (!AccountID || !deposit_mode || !amount || !image_proof) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Create a new deposit request
      const newDepositRequest = new DepositRequest({
        AccountID,
        Deposit_mode: deposit_mode,
        amount,
        image_proof,
      });

      await newDepositRequest.save({ session });

      // Update the user's balance
      const updateResult = await User.updateOne(
        { AccountID },
        { $inc: { amount } },
        { session }
      );

      if (updateResult.modifiedCount > 0) {
        // Commit the transaction
        await session.commitTransaction();
        return res.status(201).json({
          message: "Deposit request submitted successfully and balance updated.",
        });
      } else {
        // Rollback the transaction
        await session.abortTransaction();
        return res.status(500).json({
          message: "Failed to update balance.",
        });
      }
    } catch (error) {
      // Rollback the transaction in case of error
      await session.abortTransaction();
      console.error("Error submitting deposit request:", error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error submitting deposit request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// List all deposit requests for a given AccountID
const listDepositRequests = async (req, res) => {
  try {
    const { AccountID } = req.params;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required" });
    }

    const requests = await DepositRequest.find({ AccountID });

    if (requests.length === 0) {
      return res.status(404).json({ message: "No deposit requests found" });
    }

    res.json(requests);
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { submitDepositRequest, listDepositRequests };
