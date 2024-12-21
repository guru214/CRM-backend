import express from 'express';
import { submitUserProof, listUserProofs } from '../controllers/userControllers/userDocControllers.js';
import verifyToken from '../middleware/verifyToken.js'; 

const router = express.Router();

// Define routes with verifyToken middleware
router.post('/', verifyToken, submitUserProof);
router.get('/', verifyToken, listUserProofs);

export default router;