import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
// import { encryptPassword, generateRandomString } from "../../lib/EncryptDecrypt/passwordEncryptDecrypt.js";
import nodemailer from 'nodemailer';
import User from "../../models/User.js";
import crypto from 'crypto';
import { openConnection, closeConnection } from "../../config/sqlconnection.js";
dotenv.config(); // Load environment variables


// AES-GCM encryption configuration 
const algorithm = 'aes-256-gcm';
const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');  // Use secret key from .env 

// Encryption Function 
const encryptPassword = (text, iv) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv}:${encrypted}:${authTag};`
};

const generateRandomString = (length) => {
  const characters = 'f01a23b45c67d89e'; // Define the character set
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

const ChangePassword = async (req, res) => {
  try {
    await openConnection();
    const id = req.user.userId; // Extract user ID from the authenticated request
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    // Fetch the user by ID
    const Finduser = await User.findOne({ where: { id } });
    if (!Finduser) {
      return res.status(404).json({ message: "User not found" });
    }
    const realIv = Finduser.iv.substring(5, 29); // Extract the IV from stored data
    const encryptedPass = encryptPassword(oldPassword, realIv);
    const storedPassword = Finduser.Password;

    if (encryptedPass !== storedPassword) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID.message });
    }
    const randomStringOne = generateRandomString(5);
    const randomStringTwo = generateRandomString(10);
    // Hash the new password
    const iv = crypto.randomBytes(12).toString('hex');
    console.log(iv);
    const securedIv = randomStringOne + iv + randomStringTwo;
    console.log(securedIv);
    const hashedNewPassword = encryptPassword(newPassword, iv)
    // Update the password in the database
    await Finduser.update({ Password: hashedNewPassword, iv: securedIv });

    // Respond with success
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error during password change:", error);
    return res.status(500).json({ message: "Internal server error", error });
  } finally {
    await closeConnection();
  }
};

const ForgetPassword = async (req, res) => {
  try {
    await openConnection();
    const { Email } = req.body;

    // Validate input
    if (!Email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find the user by email using Sequelize
    const user = await User.findOne({ where: { Email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User ID:", user.id);

    // Generate a JWT reset token
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    const resetLink = `https://crmrichessesolutions.vercel.app/resetPassword/${resetToken}`;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with success message
    return res
      .status(200)
      .json({ message: "Password reset link sent to email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  } finally {
    await closeConnection();
  }
};

const ResetPassword = async (req, res, next) => {
  try {
    await openConnection();
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }

    // Verify the token and extract the user's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded Token:", decoded);

    // Find the user by ID
    const user = await User.findOne({ where: { id: decoded.id } });
    console.log("users", user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const randomStringOne = generateRandomString(5);
    const randomStringTwo = generateRandomString(10);
    // Hash the new password
    const iv = crypto.randomBytes(12).toString('hex');
    // console.log(iv);
    const securedIv = randomStringOne + iv + randomStringTwo;
    // console.log(securedIv);
    const hashedNewPassword = encryptPassword(newPassword, iv)
    // Update the user's password
    await user.update({ Password: hashedNewPassword, iv: securedIv });

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error);

    // Handle JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token expired." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token." });
    }

    // Pass other errors to the global error handler
    next(error);
  } finally {
    await closeConnection();
  }
};

export { ChangePassword, ForgetPassword, ResetPassword };

