import express from "express";
import { Login, Register, verifyEmail, Logout } from "../controllers/userControllers/authControllers.js";
import {Profile, UpdateProfile} from '../controllers/userControllers/profileControllers.js'
import { ChangePassword, ForgetPassword, ResetPassword } from "../controllers/userControllers/userPasswordControllers.js";
import { ChangeRole, DeleteUser, GetUsers, GetUsersAndAdmins, KYCUpdate } from "../controllers/userControllers/userManagementControllers.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorization.js";
import isEmailVerified from "../middleware/isEmailVerified.js";
const router = express.Router();

// Register route
router.post("/register", Register);

// Login route
router.post("/login", Login);

//VerifyEmail route
router.post("/verifyEmail/:token", verifyToken, verifyEmail);

// Logout route
router.post("/logout",verifyToken, isEmailVerified, Logout);

// Get user profile
router.get("/profile", verifyToken, isEmailVerified, Profile);

// Update user profile
router.put("/profile",verifyToken, isEmailVerified, UpdateProfile);

// Change password
router.put("/changepassword",verifyToken, ChangePassword);

//Forget password
router.post('/forgetpassword', ForgetPassword);

//reset password
router.post('/resetpassword/:token', verifyToken, ResetPassword);

//get all users
router.get('/getUsers', verifyToken, isEmailVerified, authorizeRoles(['superAdmin', 'Admin']), GetUsers)

//get all users and admins
router.get('/getUsersAndAdmins', verifyToken,  isEmailVerified, authorizeRoles(['superAdmin']), GetUsersAndAdmins)

//change role
router.patch('/changeRole', verifyToken,  isEmailVerified, authorizeRoles(['superAdmin']), ChangeRole);

// Update KYC details
router.patch("/kyc", verifyToken,  isEmailVerified, authorizeRoles(['superAdmin']), KYCUpdate);

//Delete a user
router.delete("/deleteUser", verifyToken,  isEmailVerified, authorizeRoles(['superAdmin']), DeleteUser);

export default router;
