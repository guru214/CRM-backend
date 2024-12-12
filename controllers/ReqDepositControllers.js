import { connectDB, closeDB } from "../config/mongodb.js"; 
import DepositRequest from "../models/DepositRequest.js";
import { encrypt, decrypt } from "../lib/encryptDecrypt.js";

const encryptDepositReq = (depositData) => {
  return {
    deposit_mode: encrypt(depositData.deposit_mode) || null,
    amount: depositData.amount || null,
    image_proof: encrypt(depositData.image_proof) || null,
  };
};

const decryptDepositReq = (encryptedDepositData) => {
  return encryptedDepositData.map((data) => ({
    deposit_mode: decrypt(data.deposit_mode) || null,
    amount: data.amount || null, 
    image_proof: decrypt(data.image_proof) || null,
  }));
};

// Submit a new deposit request
const submitDepositRequest = async (req, res) => {
  try {
    await connectDB();
    const AccountID =  req.user.AccountID;
    const { depositReq } = req.body;
    console.log(depositReq)

    if (!AccountID) {
      return res.status(400).json({ message: "SOmethingg went wrong!!" });
    }
    const encryptedDepositReqData = encryptDepositReq(depositReq);

    // const encryptedAmount = encrypt(amount.toString());
      // Create a new deposit request
      const newDepositRequest = await DepositRequest.create({
        AccountID,
        ...encryptedDepositReqData
      });

      await newDepositRequest.save();

      console.log("deposited amount:",encryptedDepositReqData.amount);

      res.status(201).json({message: "deposit request successfully!"})
    } catch (error) {
      console.error("Error submitting deposit request:", error);
      return res.status(500).json({ message: "Internal server error" });
    }finally{
      await closeDB();
    }
  }

// List all deposit requests for a given AccountID
const listDepositRequests = async (req, res) => {
  try {
    await connectDB();
    const AccountID = req.user.AccountID;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required" });
    }

    const depositData = await DepositRequest.find({ AccountID });

    console.log(depositData)
    if (depositData.length === 0) {
      return res.status(404).json({ message: "No deposit requests found" });
    }

    const decryptedDepositData = decryptDepositReq(depositData);
    console.log(decryptedDepositData);
    res.json(decryptedDepositData);
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally{
    await closeDB();
  }
};

export { submitDepositRequest, listDepositRequests };
