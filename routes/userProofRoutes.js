import express from 'express';
import { submitDocument, getDocument, deleteDocument, listDocuments } from '../controllers/userControllers/userDocControllers.js';
import verifyToken from '../middleware/verifyToken.js';
import isEmailVerified from '../middleware/isEmailVerified.js';
import multer from 'multer';
import authorizeRoles from '../middleware/authorization.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Route for submitting documents
router.post(
  '/',
  verifyToken,
  isEmailVerified,
  upload.fields([
    { name: "AadhaarProof", maxCount: 1 },
    { name: "NationalityProof", maxCount: 1 },
    { name: "PassportProof", maxCount: 1 },
    { name: "DrivingLicenseProof", maxCount: 1 },
    { name: "OtherProof", maxCount: 1 },
  ]),
  submitDocument
);

// Route for listing documents
router.get('/getDocument', verifyToken, isEmailVerified, getDocument);

router.get('/listProofs', verifyToken, isEmailVerified, authorizeRoles(['superAdmin']), listDocuments)

router.delete('/', verifyToken, isEmailVerified, deleteDocument);

export default router;
