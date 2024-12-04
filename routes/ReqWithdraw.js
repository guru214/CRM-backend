import express from "express";
import {
  submitWithdrawRequest,
  updateWithdrawRequest,
  getWithdrawRequests,
  deleteWithdrawRequest,
} from "../controllers/ReqWithdraw.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Route to submit a new withdrawal request
router.post("/submit", verifyToken, submitWithdrawRequest);

// Route to update an existing withdrawal request
router.put("/update", verifyToken, updateWithdrawRequest);

// Route to fetch withdrawal requests by AccountID
router.get("/:AccountID",verifyToken, getWithdrawRequests);

// Route to delete a withdrawal request by ID
router.delete("/:id",verifyToken, deleteWithdrawRequest);

export default router;
