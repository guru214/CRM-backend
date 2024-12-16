import { connectDB, closeDB } from "../config/mongodb.js";
import DepositRequest from "../models/DepositRequest.js";
import { encrypt, decrypt } from "../lib/encryptDecrypt.js";
import fs from "fs";

// Helper function to encrypt deposit request data
const encryptDepositReq = (depositData) => {
  if (!fs.existsSync(depositData.image_proof)) {
    throw new Error(`Image proof file not found at path: ${depositData.image_proof}`);
  }

  const imageBuffer = fs.readFileSync(depositData.image_proof); // Read image file as buffer
  const imageBase64 = imageBuffer.toString("base64"); // Convert image to Base64 string

  return {
    deposit_mode: depositData.deposit_mode ? encrypt(depositData.deposit_mode) : null,
    amount: depositData.amount ? encrypt(depositData.amount.toString()) : null, // Ensure amount is saved as a string
    image_proof: imageBase64 ? encrypt(imageBase64) : null, // Encrypt the Base64 string
  };
};

// Helper function to decrypt deposit request data
const decryptDepositReq = (encryptedDepositData) => {
  return encryptedDepositData.map((data) => {
    const decryptedImageBase64 = decrypt(data.image_proof);
    return {
      deposit_mode: data.deposit_mode ? decrypt(data.deposit_mode) : null,
      amount: data.amount ? parseFloat(decrypt(data.amount)) : null,
      image_proof: decryptedImageBase64 || null, // Decrypted Base64 string
    };
  });
};

// Submit a new deposit request
const submitDepositRequest = async (req, res) => {
  try {
    await connectDB();

    const AccountID = req.user.AccountID;
    const { depositData } = req.body;
    console.log(AccountID)
    // console.log(depositData)

    if (!AccountID || !depositData) {
      return res.status(400).json({ message: "AccountID and deposit data are required." });
    }

    const encryptedDepositReqData = encryptDepositReq(depositData);

    // Create a new deposit request
    const newDepositRequest = new DepositRequest({
      AccountID,
      ...encryptedDepositReqData,
    });

    await newDepositRequest.save();

    console.log("Deposited amount:", depositData.amount);

    res.status(201).json({ message: "Deposit request submitted successfully!" });
  } catch (error) {
    console.error("Error submitting deposit request:", error);
    res.status(500).json({ message: "Internal server error." });
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
      return res.status(400).json({ message: "AccountID is required." });
    }

    const depositData = await DepositRequest.find({ AccountID });

    if (!depositData || depositData.length === 0) {
      return res.status(404).json({ message: "No deposit requests found." });
    }

    const decryptedDepositData = decryptDepositReq(depositData);

    res.status(200).json(decryptedDepositData);
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    await closeDB();
  }
};

export { submitDepositRequest, listDepositRequests };
