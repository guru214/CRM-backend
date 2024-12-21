import express from "express";
import { Login, Register, Logout } from "../controllers/userControllers/authControllers.js";
import {Profile, UpdateProfile} from '../controllers/userControllers/profileControllers.js'
import { ChangePassword, ForgetPassword, ResetPassword } from "../controllers/userControllers/userPasswordControllers.js";
import { ChangeRole, DeleteUser, GetUsers, GetUsersAndAdmins, KYCUpdate } from "../controllers/userControllers/userManagementControllers.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorization.js";
const router = express.Router();

// Register route
router.post("/register", Register);

// Login route
router.post("/login", Login);

// Logout route
router.post("/logout",verifyToken, Logout);

// Get user profile
router.get("/profile", verifyToken, Profile);

// Update user profile
router.put("/profile",verifyToken, UpdateProfile);

// Change password
router.put("/changepassword",verifyToken, ChangePassword);

//Forget password
router.post('/forgetpassword',  ForgetPassword);

//reset password
router.post('/resetpassword/:token', verifyToken, ResetPassword);

//get all users
router.get('/getUsers', verifyToken, authorizeRoles(['superAdmin', 'Admin']), GetUsers)

//get all users and admins
router.get('/getUsersAndAdmins', verifyToken, authorizeRoles(['superAdmin']), GetUsersAndAdmins)

//change role
router.patch('/changeRole', verifyToken, authorizeRoles(['superAdmin']), ChangeRole);

// Update KYC details
router.patch("/kyc", verifyToken, authorizeRoles(['superAdmin']), KYCUpdate);

//Delete a user
router.delete("/deleteUser", verifyToken, authorizeRoles(['superAdmin']), DeleteUser);

export default router;
