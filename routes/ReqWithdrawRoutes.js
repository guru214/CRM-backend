import express from "express";
import {
  submitWithdrawRequest,
  getWithdrawRequests,
  cancelWithdrawRequest,
} from "../controllers/ReqWithdrawControllers.js";
import verifyToken from "../middleware/verifyToken.js";
import isEmailVerified from '../middleware/isEmailVerified.js';

const router = express.Router();

// Route to submit a new withdrawal request
router.post("/", verifyToken, isEmailVerified,  submitWithdrawRequest);

// Route to fetch withdrawal requests by AccountID
router.get("/",verifyToken, isEmailVerified, getWithdrawRequests);

// Route to delete a withdrawal request by ID
router.delete("/:id",verifyToken, isEmailVerified, cancelWithdrawRequest);

export default router;
