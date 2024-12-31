
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { encrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
import { generateAccountID, generateReferralID } from "../../lib/uidGeneration.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
// import { encryptPassword, generateRandomString } from "../../lib/EncryptDecrypt/passwordEncryptDecrypt.js"
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

// Function to generate tokens
const generateTokens = (userId, Email, AccountID, Role) => {
  const accessToken = jwt.sign({ userId, Email, AccountID, Role }, process.env.JWT_SECRET, { expiresIn: "60m" });
  const refreshToken = jwt.sign({ userId, Email, AccountID, Role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Function to encrypt user data
const encryptUserData = (userData) => {
  return {
    FullName: userData.FullName ? encrypt(userData.FullName) : null,
    Email: userData.Email ? userData.Email : null, //for some reason
    Phone: userData.Phone ? encrypt(userData.Phone) : null,
    Account_Type: userData.Account_Type ? encrypt(userData.Account_Type) : null,
    Address: userData.Address ? encrypt(userData.Address) : null,
  };
};

// Register function
const Register = async (req, res) => {
  try {
    await openConnection();
    const { FullName, Email, Password, Phone, Account_Type, Address } = req.body;
    // Check if the user already exists in the database
    const existingUser = await User.findOne({ where: { Email } });
    if (existingUser) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.ALREADY_EXIST.message });
    }
    // Encrypt user data
    const encryptedUserData = encryptUserData({ FullName, Email, Phone, Account_Type, Address });
    const randomStringOne = generateRandomString(5);
    const randomStringTwo = generateRandomString(10);
    const iv = crypto.randomBytes(12).toString('hex');
    // console.log(iv);
    const securedIv = randomStringOne + iv + randomStringTwo;
    // console.log(securedIv);
    const encryptedPassword = encryptPassword(Password, iv)
    // console.log("encrypted password", encryptedPassword);
    // Generate unique AccountID and ReferralID
    const AccountID = generateAccountID();
    const ReferralID = generateReferralID(FullName);
    // const Roles = ['user', 'admin', 'superadmin'];
    const Role = 'User';
    const KYC_Status = 'Pending';
    const isEmailVerified = 'No';
    const amount = "0.00";
    const encryptedAmount = encrypt(amount);
    const newUser = await User.create({
      FullName: encryptedUserData.FullName,
      Email: Email,
      Password: encryptedPassword,
      Phone: encryptedUserData.Phone,
      Account_Type: encryptedUserData.Account_Type,
      Address: encryptedUserData.Address,
      documentType: encryptedUserData.documentType,
      documentNumber: encryptedUserData.documentNumber,
      KYC_Status: KYC_Status,
      amount: encryptedAmount,
      AccountID: AccountID,
      ReferralID: ReferralID,
      Role: Role,
      isEmailVerified: isEmailVerified,
      iv: securedIv,
    });
    if (newUser) {
      res.status(201).json({ message: "User registered successfully", AccountID, ReferralID });
    } else {
      res.status(500).json({ message: "Failed to register user" });
    }
  } catch (error) {
    // console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await closeConnection();
  }
};

// Login function
const Login = async (req, res) => {
  try {
    await openConnection();
    const { Email, Password } = req.body;
    // Check if email and password are provided
    if (!Email || !Password) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.BAD_REQUEST.message });
    }
    // Find the user by email using Sequelize
    const Finduser = await User.findOne({ where: { Email } });
    if (!Finduser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const realIv = Finduser.iv.substring(5, 29); // Extract the IV from stored data
    const encryptedPass = encryptPassword(Password, realIv);
    const storedPassword = Finduser.Password;
    // console.log(encryptedPass)
    // console.log(storedPassword)
    // console.log("sdf",Finduser.Password)
    if (encryptedPass !== storedPassword) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID.message });
    }
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(Finduser.id, Finduser.Email, Finduser.AccountID, Finduser.Role);
    const Role = Finduser.Role
    const isEmailVerified = Finduser.isEmailVerified;
    // Update the refresh token in the database
    await User.update(
      { refreshToken: refreshToken },
      { where: { id: Finduser.id } }
    );

    // Set the access token as a cookie (HTTP-only cookie for security)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,

      //should be ued in production level
      secure: true, // Use secure cookies in production 
      sameSite: 'None',  // Prevent CSRF attacks  
      //should be ued in local
      // secure: false,       // Set to true if using HTTPS
      // sameSite: 'None',    // Allows cross-origin cookies
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    // Optionally, set the refresh token as a cookie (HTTP-only cookie for security)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      //should be ued in production level
      secure: true, // Use secure cookies in production 
      sameSite: 'None', // Prevent CSRF attacks    
      //should be ued in local
      // secure: false,       // Set to true if using HTTPS
      // sameSite: 'None',    // Allows cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // res.cookie('token', token, {
    //   httpOnly: true,      // Prevents access via JavaScript
    //   secure: false,       // Set to true if using HTTPS
    //   sameSite: 'None',    // Allows cross-origin cookies
    // Decrypt user data if necessary
    // const decryptedUserData = decryptUserData(Finduser);
    // console.log('d ::d',decryptedUserData);
    return res.status(200).json({
      message: "Login successful",
      // user: decryptedUserData,
      Role,
      isEmailVerified,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await closeConnection();
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await openConnection();
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded token:", decoded);

    const verifyUser = await User.findOne({ where: { Email: decoded.Email } });

    // const updateIsEmailVerified = verifyUser.isEmailVerified;
    const isEmailVerified = "Yes";
    // const emailVerified =
    await verifyUser.update({ isEmailVerified: isEmailVerified })
    // await emailVerified.save();
    res.status(200).json({ message: "Your Email has been verified successfully." });
  }
  catch (error) {
    console.error("error in verifying email:", error)
    // Handle JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Email verification token expired." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token." });
    }
    next(error);
  }
  finally {
    await closeConnection();
  }
};

// Logout Function
const Logout = async (req, res) => {
  try {
    await openConnection();
    const { refreshToken } = req.cookies;
    // Check if the refresh token is provided
    if (!refreshToken) {
      return res.status(400).json({ message: "No token provided" });
    }
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    // Find the user using the decoded user ID from the refresh token
    const Finduser = await User.findOne({ where: { id: decoded.userId } });
    if (!Finduser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update the user's refresh token to NULL
    await Finduser.update({ refreshToken: null });
    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    // console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await closeConnection();
  }
};

export { Register, Login, verifyEmail, Logout };

