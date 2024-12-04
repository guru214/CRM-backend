import mySqlPool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Submit a new withdrawal request
const submitWithdrawRequest = async (req, res) => {
  try {
    const { AccountID, mode_name, amount } = req.body;

    if (!AccountID || !mode_name || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Start a transaction
    const connection = await mySqlPool.getConnection();
    try {
      await connection.beginTransaction();

      // Fetch current balance
      const [userRows] = await connection.query(
        "SELECT amount FROM server_crm.users WHERE AccountID = ?",
        [AccountID]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ message: "Account not found" });
      }

      const currentBalance = userRows[0].amount;

      if (currentBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Validate withdrawal mode
      const [modeRows] = await connection.query(
        "SELECT * FROM server_crm.withdraw_modes WHERE AccountID = ? AND withdraw_mode = ?",
        [AccountID, mode_name]
      );

      if (modeRows.length === 0) {
        return res.status(400).json({ message: "Invalid withdrawal mode" });
      }

      // Insert the withdrawal request
      const [insertResult] = await connection.query(
        `INSERT INTO server_crm.withdraw_requests (AccountID, withdraw_mode, amount) VALUES (?, ?, ?)`,
        [AccountID, mode_name, amount]
      );

      if (insertResult.affectedRows === 0) {
        throw new Error("Failed to create withdrawal request");
      }

      // Deduct the amount from the user's balance
      const [updateResult] = await connection.query(
        `UPDATE server_crm.users SET amount = amount - ? WHERE AccountID = ?`,
        [amount, AccountID]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("Failed to update balance");
      }

      // Commit the transaction
      await connection.commit();
      return res.status(201).json({ message: "Withdrawal request submitted successfully" });
    } catch (transactionError) {
      // Rollback on error
      await connection.rollback();
      console.error("Transaction error:", transactionError);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error submitting withdrawal request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update an existing withdrawal request
const updateWithdrawRequest = async (req, res) => {
  try {
    const { id, status, processed_date } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await mySqlPool.query(
      `UPDATE server_crm.withdraw_requests SET status = ?, processed_date = ? WHERE id = ?`,
      [status, processed_date || null, id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Withdrawal request updated successfully" });
    } else {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
  } catch (error) {
    console.error("Error updating withdrawal request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch withdrawal requests by AccountID
const getWithdrawRequests = async (req, res) => {
  try {
    const {AccountID} = req.params;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required" });
    }

    const [result] = await mySqlPool.query(
      `SELECT wr.id, wr.AccountID, wr.withdraw_mode, wr.amount, wr.status, wr.request_date, wr.processed_date
       FROM server_crm.withdraw_requests wr
       WHERE wr.AccountID = ?`,
      [AccountID]
    );

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

// Delete a withdrawal request by ID
const deleteWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const [result] = await mySqlPool.query(
      `DELETE FROM server_crm.withdraw_requests WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Withdrawal request deleted successfully" });
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
  updateWithdrawRequest,
  getWithdrawRequests,
  deleteWithdrawRequest,
};
