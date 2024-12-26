import User from "../../models/User.js";
import withdrawRequest from "../../models/withdrawRequestModel.js";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
import { connectDB, closeDB } from "../../config/mongodb.js";
dotenv.config(); // Load environment variables


const encryptWithdrawReq = (withdrawData) => {
  return {
    withdraw_mode: withdrawData.withdraw_mode ? encrypt(withdrawData.withdraw_mode) : null,
    amount: withdrawData.amount? encrypt(withdrawData.amount.toString()) : null,
  };
};

const decryptWithdrawReq = (encryptedWithdrawData) => {
  return encryptedWithdrawData.map((data) => ({
    withdraw_mode: data.withdraw_mode? decrypt(data.withdraw_mode) : null,
    amount: data.amount? parseFloat(decrypt(data.amount)) : null, 
  }));
};

// Submit a new withdrawal request
const submitWithdrawRequest = async (req, res) => {
  try {
    await connectDB();
    const AccountID  = req.user.AccountID;
    const { withdraw_mode, amount } = req.body;
    const status = "Pending";

    // Check if required fields are provided
    if (!AccountID || !withdraw_mode || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    // Validate deposit mode
    const validWithdrawModes = ['Bank', 'UPI', 'BTC', 'Netteller', 'ETH'];
    if (!validWithdrawModes.includes(withdraw_mode)) {
      return res.status(400).json({ message: "Invalid Withdraw mode." });
    }
    const validWithdrawStatus = ['Pending', 'Approved', 'Rejected'];
    if(!validWithdrawStatus.includes(status)){
      return res.status(400).json({message: "Invalid Withdraw Status."})
    }

    const encryptedWithdrawData = encryptWithdrawReq({withdraw_mode, amount});

    //This code should be at the Admin Route 
    // // Fetch the user's balance
    // const user = await User.findOne({
    //   where: { AccountID: AccountID }
    // });

    // console.log("user balance", user)
    // if (!user) {
    //   return res.status(404).json({ message: "Account not found" });
    // }

    // const currentBalance = parseFloat(decrypt(user.amount)); 
    // console.log(currentBalance);
    // console.log(amount);
    // if (currentBalance < amount) {
    //   return res.status(400).json({ message: "Insufficient balance" });
    // }
    // const userBalance = currentBalance - amount;
    // console.log(userBalance)
    // user.amount = encrypt(userBalance.toString());

    // await user.save();
    // console.log("saved")
    // Create the withdrawal request
    const submitWithdrawData = new withdrawRequest({
      AccountID,
      ...encryptedWithdrawData,
      status: status,
    });

    await submitWithdrawData.save();
    return res.status(201).json({ message: "Withdrawal request submitted successfully", submitWithdrawData });
  } catch (err) {
    console.error("Error during withdrawal request submission:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await closeDB();
  }
};

  // Fetch withdrawal requests by AccountID
  const getWithdrawRequests = async (req, res) => {
    try {
      await connectDB();
      const AccountID = req.user.AccountID;

      if (!AccountID) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const withdrawData = await withdrawRequest.find({ AccountID});

      if (!withdrawData || withdrawData.length === 0) {
        return res.status(404).json({ message: "No withdrawal requests found" });
      }

      const decryptedWithdrawData = decryptWithdrawReq(withdrawData);
      res.status(200).json(decryptedWithdrawData);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      await closeDB();
    }
  };

  // cancel a withdrawal request by ID
  const cancelWithdrawRequest = async (req, res) => {
    try {
      connectDB();
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
    } finally {
      await closeDB();
    }
  };

  export {
    submitWithdrawRequest,
    getWithdrawRequests,
    cancelWithdrawRequest,
  };
