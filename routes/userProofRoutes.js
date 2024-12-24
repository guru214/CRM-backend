import express from 'express';
import { submitUserProof, listUserProofs } from '../controllers/userControllers/userDocControllers.js';
import verifyToken from '../middleware/verifyToken.js'; 
import isEmailVerified from '../middleware/isEmailVerified.js';
const router = express.Router();

// Define routes with verifyToken middleware
router.post('/', verifyToken,  isEmailVerified, submitUserProof);
router.get('/', verifyToken, isEmailVerified, listUserProofs);

export default router;