import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorization.js";
import isEmailVerified from "../middleware/isEmailVerified.js";
import { createReturns, getReturns, listAllReturns } from "../controllers/monthlyReturnControllers/ReturnsControllers.js";

const router = express.Router();

router.get('/getReturns', verifyToken, isEmailVerified, getReturns);

router.post('/createReturns', verifyToken, isEmailVerified, authorizeRoles(['superAdmin']), createReturns);

router.get('/listReturns', verifyToken, isEmailVerified, authorizeRoles(['superAdmin']), listAllReturns);

export default router;