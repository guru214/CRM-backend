import User from "../models/User.js";
import withdrawRequest from "../models/withdrawRequestModel.js";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../lib/encryptDecrypt.js";
dotenv.config(); // Load environment variables


const encryptWithdrawReq = (withdrawData) => {
  return {
    withdraw_mode: encrypt(withdrawData.withdraw_mode) || null,
    amount: withdrawData.amount || null,
  };
};

const decryptWithdrawReq = (encryptedWithdrawData) => {
  return encryptedWithdrawData.map((data) => ({
    withdraw_mode: decrypt(data.withdraw_mode) || null,
    amount: data.amount || null, 
  }));
};

// Submit a new withdrawal request
const submitWithdrawRequest = async (req, res) => {
  try {
    const AccountID  = req.user.AccountID;
    const { withdrawReq } = req.body;
    console.log("req is:", withdrawReq)

    // Check if required fields are provided
    if (!withdrawReq) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const encryptedWithdrawReq = encryptWithdrawReq(withdrawReq);

    // Fetch the user's balance
    const user = await User.findOne({
      where: { AccountID: AccountID },
      attributes: ['amount'] 
    });

    console.log("user balance", user)
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const currentBalance = user.amount; 
    console.log(currentBalance);
    console.log(withdrawReq.amount);
    if (currentBalance < withdrawReq.amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create the withdrawal request
    const submitWithdrawReq = await withdrawRequest.create({
      AccountID,
      ...encryptedWithdrawReq
    });
    return res.status(201).json({ message: "Withdrawal request submitted successfully", submitWithdrawReq });
  } catch (err) {
    console.error("Error during withdrawal request submission:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

  // Fetch withdrawal requests by AccountID
  const getWithdrawRequests = async (req, res) => {
    try {
      const AccountID = req.user.AccountID;

      if (!AccountID) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await withdrawRequest.find({AccountID: AccountID});

      if (result.length > 0) {
        return res.status(200).json({
          message: "Withdrawal requests fetched successfully",
          data: result,
        });
      } else {
        return res.status(404).json({ message: "No withdrawal requests found" });
      }
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // cancel a withdrawal request by ID
  const cancelWithdrawRequest = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const result = await withdrawRequest.findOneAndDelete({_id: id})

      if (result) {
        return res.status(200).json({ message: "Withdrawal request canceled successfully" });
      } else {
        return res.status(404).json({ message: "Withdrawal request not found" });
      }
    } catch (error) {
      console.error("Error deleting withdrawal request:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  export {
    submitWithdrawRequest,
    getWithdrawRequests,
    cancelWithdrawRequest,
  };
