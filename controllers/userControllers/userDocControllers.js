import { connectDB, closeDB } from "../../config/mongodb.js";
import userProof from "../../models/userProof.js";
import { encryptDocumentProof, decryptDocumentProof } from "../../lib/EncryptDecrypt/documentProof.js";

// Submit a new deposit request
const submitUserProof = async (req, res) => {
  try {
    await connectDB();

    const AccountID = req.user.AccountID;
    const { AadhaarProof, NationalityProof } = req.body;


    if (!AccountID || !AadhaarProof || !NationalityProof) {
      return res.status(400).json({ message: "AccountID and deposit data are required." });
    }

    const encryptedDocumentProof = encryptDocumentProof({ AadhaarProof, NationalityProof});

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
