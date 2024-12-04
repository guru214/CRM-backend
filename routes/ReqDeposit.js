// depositRoutes.js
import express from 'express';
import { submitDepositRequest, listDepositRequests } from '../controllers/ReqDeposit.js'; // Adjust the path as necessary
import verifyToken from '../middleware/verifyToken.js'; // Adjust the path as necessary

const router = express.Router();

// Define routes with verifyToken middleware
router.post('/', verifyToken, submitDepositRequest);
router.get('/:AccountID', verifyToken, listDepositRequests);

export default router;
