import express from 'express';
import { submitUserProof, listUserProofs } from '../controllers/userControllers/userDocControllers.js';
import verifyToken from '../middleware/verifyToken.js'; 
import isEmailVerified from '../middleware/isEmailVerified.js';
import multer from 'multer'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Define routes with verifyToken middleware
router.post('/', verifyToken,  isEmailVerified, upload.fields([ { name: 'AadhaarProof', maxCount: 1 }, { name: 'NationalityProof', maxCount: 1 }]), submitUserProof);
router.get('/', verifyToken, isEmailVerified, listUserProofs);

export default router;