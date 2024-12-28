import express from "express";
import {
  submitWithdrawRequest,
  getWithdrawRequests,
  cancelWithdrawRequest,
} from "../controllers/withdrawControllers/ReqWithdrawControllers.js";
import verifyToken from "../middleware/verifyToken.js";
import isEmailVerified from '../middleware/isEmailVerified.js';
import { ChangeWithdrawStatus } from "../controllers/withdrawControllers/withdrawManagement.js";
import authorizeRoles from "../middleware/authorization.js";
import multer from 'multer'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Route to submit a new withdrawal request
router.post("/", verifyToken, isEmailVerified, submitWithdrawRequest);

// Route to fetch withdrawal requests by AccountID
router.get("/",verifyToken, isEmailVerified, getWithdrawRequests);

// Route to delete a withdrawal request by ID
router.delete("/:id",verifyToken, isEmailVerified, cancelWithdrawRequest);

//Route to change the status of a withdrawal
router.patch('/changeStatus',verifyToken, isEmailVerified, authorizeRoles(['superAdmin']), ChangeWithdrawStatus);


export default router;
