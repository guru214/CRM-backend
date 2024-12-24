// depositRoutes.js
import express from 'express';
import { submitDepositRequest, listDepositRequests } from '../controllers/ReqDepositControllers.js'; // Adjust the path as necessary
import verifyToken from '../middleware/verifyToken.js'; // Adjust the path as necessary
import isEmailVerified from '../middleware/isEmailVerified.js';

const router = express.Router();

// Define routes with verifyToken middleware
router.post('/', verifyToken, isEmailVerified, submitDepositRequest);
router.get('/', verifyToken, isEmailVerified, listDepositRequests);

export default router;
