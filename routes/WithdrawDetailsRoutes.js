import express from "express";
import { submitWithdrawDetails, updateWithdrawDetails, getWithdrawDetails } from "../controllers/WithdrawDetailsControllers.js"; // Assuming controller is in 'controllers' folder
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Route to submit Withdraw details
router.post("/",verifyToken, submitWithdrawDetails);

// Route to update Withdraw details
router.put("/",verifyToken, updateWithdrawDetails);

// Route to get Withdraw details by AccountID
router.get("/details/:AccountID",verifyToken, getWithdrawDetails);

export default router;
