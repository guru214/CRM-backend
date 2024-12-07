// import { encrypt, decrypt } from '../middleware/encryptDecrypt.js'; 
import mySqlPool from "../config/dbOld.js";

// Function to handle image upload and encryption
// const encryptImageProof = (image) => {
//   // Convert image buffer to a base64 string before encrypting
//   const imageBase64 = image.toString('base64');
//   return encrypt(imageBase64);
// };

// Submit a new deposit request
const submitDepositRequest = async (req, res) => {
  try {
    const { AccountID, deposit_mode, amount, image_proof } = req.body;
    // const { image } = req.files; // Assuming you're using a file upload middleware like multer

    if (!AccountID || !deposit_mode || !amount || !image_proof) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // encrypt sensitive information
    // const encryptedDepositMode = encrypt(deposit_mode);
    // const encryptedImageProof = encryptImageProof(image.data); // encrypt the image

    // Start a transaction
    const connection = await mySqlPool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert the deposit request into the database
      const [result] = await connection.query(
        `INSERT INTO deposit_requests (AccountID, Deposit_mode, amount, image_proof) VALUES (?, ?, ?, ?)`,
        [AccountID, deposit_mode, amount, image_proof]
      );

      // Update the user's balance
      const [updateResult] = await connection.query(
        `UPDATE users SET amount = amount + ? WHERE AccountID = ?`,
        [amount, AccountID]
      );

      if (result.affectedRows > 0 && updateResult.affectedRows > 0) {
        // Commit the transaction
        await connection.commit();
        return res.status(201).json({ message: "Deposit request submitted successfully and balance updated." });
      } else {
        // Rollback the transaction
        await connection.rollback();
        return res.status(500).json({ message: "Failed to submit deposit request or update balance." });
      }
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      console.error("Error submitting deposit request:", error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      connection.release();
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

    const [rows] = await mySqlPool.query(
      "SELECT id, Deposit_mode, amount, status, image_proof FROM deposit_requests WHERE AccountID = ?",
      [AccountID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No deposit requests found" });
    }

    // decrypt image proofs
    // const requests = rows.map(row => ({
    //   ...row,
    //   image_proof: decrypt(row.image_proof) // decrypt the image proof before sending to client
    // }));
    const requests = [rows];

    res.json(requests);
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { submitDepositRequest, listDepositRequests };
