import { connectDB, closeDB } from "../config/mongodb.js";
import userProof from "../models/userProof.js";
import { encrypt, decrypt } from "../lib/encryptDecrypt.js";
import fs from "fs";

// Helper function to encrypt deposit request data
const encryptDocumentProof = (documentProof) => {

  const AadhaarProof = fs.readFileSync(documentProof.AadhaarProof); // Read image file as buffer
  const AadhaarBase64 = AadhaarProof.toString("base64"); // Convert image to Base64 string

  const NationalityProof = fs.readFileSync(documentProof.NationalityProof);
  const NationalityBase64 = NationalityProof.toString("base64");

  return {
    AadhaarProof: AadhaarBase64 ? encrypt(AadhaarBase64) : "", // Encrypt the Base64 string 
    NationalityProof: NationalityBase64 ? encrypt(NationalityBase64) : "", // Encrypt the Base64 string
  };
};

// Helper function to decrypt deposit request data
const decryptDocumentProof = (encryptedDocumentProof) => {
  return encryptedDocumentProof.map((data) => {
    const decryptAadhaarProof = decrypt(data.AadhaarProof);
    const decryptNationalityProof = decrypt(data.NationalityProof);

    return {
      AadhaarProof: decryptAadhaarProof || "", // Decrypted Base64 string
      Nationality: decryptNationalityProof || "", // Decrypted Base64 string
    };
  });
};

// Submit a new deposit request
const submitUserProof = async (req, res) => {
  try {
    await connectDB();

    const AccountID = req.user.AccountID;
    const { documentProof } = req.body;


    if (!AccountID || !documentProof) {
      return res.status(400).json({ message: "AccountID and deposit data are required." });
    }

    const encryptedDocumentProof = encryptDocumentProof(documentProof);

    // Create a new deposit request
    const newUserProof = new userProof({
      AccountID,
      ...encryptedDocumentProof,
    });

    await newUserProof.save();


    res.status(201).json({ message: "Documents submitted successfully!" });
  } catch (error) {
    console.error("Error submitting documents:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    await closeDB();
  }
};

// List all deposit requests for a given AccountID
const listUserProofs = async (req, res) => {
  try {
    await connectDB();

    const AccountID = req.user.AccountID;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required." });
    }

    const documentProof = await userProof.find({ AccountID });

    if (!documentProof || documentProof.length === 0) {
      return res.status(404).json({ message: "No deposit requests found." });
    }

    const decryptedDocumentProof = decryptDocumentProof(documentProof);

    res.status(200).json(decryptedDocumentProof);
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    await closeDB();
  }
};

export { submitUserProof, listUserProofs };
