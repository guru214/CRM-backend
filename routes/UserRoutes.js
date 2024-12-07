import express from "express";
import {
  Register,
  Login,
  Logout,
  Profile,
  UpdateProfile,
  ChangePassword,
  ForgetPassword,
  ResetPassword,
  KYCUpdate,
} from "../controllers/UserControllers.js"; // Adjust the path to your controller file
import verifyToken from "../middleware/verifyToken.js";
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
router.post('/resetpassword/:token',ResetPassword);

// Update KYC details
router.put("/kyc",verifyToken, KYCUpdate);

export default router;
