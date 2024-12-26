// depositRoutes.js
import express from 'express';
import { submitDepositRequest,
     listDepositRequests } from '../controllers/depositControllers/ReqDepositControllers.js'; // Adjust the path as necessary
import verifyToken from '../middleware/verifyToken.js'; // Adjust the path as necessary
import isEmailVerified from '../middleware/isEmailVerified.js';
import { ChangeDepositStatus } from '../controllers/depositControllers/depositManagmentControllers.js';
import authorizeRoles from '../middleware/authorization.js';

const router = express.Router();

// Define routes with verifyToken middleware
router.post('/', verifyToken, isEmailVerified, submitDepositRequest);
router.get('/', verifyToken, isEmailVerified, listDepositRequests);
router.patch('/changeStatus',verifyToken, isEmailVerified, authorizeRoles(['superAdmin']), ChangeDepositStatus);

export default router;
