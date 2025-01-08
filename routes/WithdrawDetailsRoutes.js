import express from "express";
import 
{ 
    submitWithdrawDetails,
    getWithdrawDetails 
} from "../controllers/withdrawControllers/WithdrawDetailsControllers.js"; // Assuming controller is in 'controllers' folder
import verifyToken from "../middleware/verifyToken.js";
import isEmailVerified from '../middleware/isEmailVerified.js';

const router = express.Router();

// Route to submit Withdraw details
router.post("/",verifyToken, isEmailVerified, submitWithdrawDetails);

// Route to update Withdraw details
// router.put("/",verifyToken, isEmailVerified, updateWithdrawDetails);

// Route to get Withdraw details by AccountID
router.get("/",verifyToken, isEmailVerified, getWithdrawDetails);

export default router;
