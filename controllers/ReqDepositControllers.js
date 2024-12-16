import { connectDB , closeDB} from "../config/mongodb.js"; 
import DepositRequest from "../models/DepositRequest.js";
import { encrypt, decrypt } from "../lib/encryptDecrypt.js";

const encryptDepositReq = (depositData) => {
  return {
    deposit_mode: depositData.deposit_mode ? encrypt(depositData.deposit_mode) : null,
    amount: depositData.amount ? depositData.amount : null, // No encryption for numeric value
    image_proof: depositData.image_proof ? encrypt(depositData.image_proof) : null,
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
    const AccountID = req.user.AccountID;
    const { amount, deposit_mode, image_proof } = req.body;

    // Input validation
    if (!AccountID || !amount || !deposit_mode || !image_proof) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const depositReq = { amount, deposit_mode, image_proof };

    const encryptedDepositReqData = encryptDepositReq(depositReq);

    // Create a new deposit request
    const newDepositRequest = await DepositRequest.create({
      AccountID,
      ...encryptedDepositReqData,
    });

    res.status(201).json({ message: "Deposit request submitted successfully!" });
  } catch (error) {
    console.error("Error submitting deposit request:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await closeDB();
  }
};

    
    

   
     
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