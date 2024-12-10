import express from "express";
import {
  submitWithdrawRequest,
  getWithdrawRequests,
  cancelWithdrawRequest,
} from "../controllers/ReqWithdrawControllers.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Route to submit a new withdrawal request
router.post("/", verifyToken, submitWithdrawRequest);

// Route to fetch withdrawal requests by AccountID
router.get("/",verifyToken, getWithdrawRequests);

// Route to delete a withdrawal request by ID
router.delete("/:id",verifyToken, cancelWithdrawRequest);

export default router;
