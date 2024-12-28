// depositRoutes.js
import express from 'express';
import { submitDepositRequest,
     listDepositRequests } from '../controllers/depositControllers/ReqDepositControllers.js'; // Adjust the path as necessary
import verifyToken from '../middleware/verifyToken.js'; // Adjust the path as necessary
import isEmailVerified from '../middleware/isEmailVerified.js';
import { ChangeDepositStatus } from '../controllers/depositControllers/depositManagmentControllers.js';
import authorizeRoles from '../middleware/authorization.js';
import multer from 'multer'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Define routes with verifyToken middleware
router.post('/', verifyToken, isEmailVerified, upload.single("image_proof"), // Handle the file upload
submitDepositRequest);
router.get('/', verifyToken, isEmailVerified, listDepositRequests);
router.patch('/changeStatus',verifyToken, isEmailVerified, authorizeRoles(['superAdmin']), ChangeDepositStatus);

export default router;
