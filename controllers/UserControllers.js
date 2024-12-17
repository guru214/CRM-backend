
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../lib/encryptDecrypt.js";
import { generateAccountID, generateReferralID } from "../lib/uidGeneration.js";
import { RESPONSE_MESSAGES } from "../lib/constants.js";
import { encryptPassword, generateRandomString } from "../lib/encryptDecryptPassword.js"
import nodemailer from 'nodemailer';
import User from "../models/User.js";
import crypto from 'crypto';
// import { openConnection, closeConnection } from "../config/sqlconnection.js";

dotenv.config(); // Load environment variables

// Function to generate tokens
const generateTokens = (userId, AccountID) => {
  const accessToken = jwt.sign({ userId, AccountID }, process.env.JWT_SECRET, { expiresIn: "60m" });
  const refreshToken = jwt.sign({ userId, AccountID }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  // const encryptedAccessToken = encrypt(accessToken) 
  // const encryptedRefreshToken = encrypt(refreshToken)
  // return { encryptedAccessToken, encryptedRefreshToken };
    return {accessToken, refreshToken};
};

// Function to encrypt user data
const encryptUserData = (userData) => {
  return {
    FullName: encrypt(userData.FullName),
    Phone: encrypt(userData.Phone),
    Account_Type: encrypt(userData.Account_Type),
    Address: encrypt(userData.Address),
  };
};

// Function to decrypt user data
const decryptUserData = (encryptedData) => {
  return {
    FullName: decrypt(encryptedData.FullName),
    Phone: decrypt(encryptedData.Phone),
    Account_Type: decrypt(encryptedData.Account_Type),
    Address: decrypt(encryptedData.Address),
  };
};

// Register function
const Register = async (req, res) => {
  try {
    //await openconnection();    
    const { FullName, Email, Password, Phone, Account_Type, Address, documentType, documentNumber } = req.body;

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ where: { Email } });
    if (existingUser) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.ALREADY_EXIST.message });
    }

    // Encrypt user data
    const encryptedUserData = encryptUserData({ FullName, Email, Phone, Account_Type, Address, documentType, documentNumber });
    const randomStringOne = generateRandomString(5);
    const randomStringTwo = generateRandomString(10);

    const iv = crypto.randomBytes(12).toString('hex');
    console.log(iv);
    const securedIv = randomStringOne + iv + randomStringTwo;
    console.log(securedIv);
    const encryptedPassword = encryptPassword(Password, iv)
    console.log("encrypted password", encryptedPassword);

    // Generate unique AccountID and ReferralID
    const AccountID = generateAccountID();
    const ReferralID = generateReferralID(FullName);
    const newUser = await User.create({
      FullName: encryptedUserData.FullName,
      Email: Email, // Email is not encrypted for uniqueness checks
      Password: encryptedPassword,
      Phone: encryptedUserData.Phone,
      Account_Type: encryptedUserData.Account_Type,
      Address: encryptedUserData.Address,
      documentType: encryptedUserData.documentType,
      documentNumber: encryptedUserData.documentNumber,
      AccountID,
      ReferralID,
      iv: securedIv,
    });
    if (newUser) {
      res.status(201).json({ message: "User registered successfully", AccountID, ReferralID });
    } else {
      res.status(500).json({ message: "Failed to register user" });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally{
    //await closeConnection();
  }
};

// Login function
const Login = async (req, res) => {
  try {
    //await openConnection();
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

    console.log(encryptedPass)
    console.log(storedPassword)
    console.log("sdf",Finduser.Password)
    if (encryptedPass !== storedPassword){
      return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID.message });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(Finduser.id, Finduser.AccountID);

    // Update the refresh token in the database
    await User.update(
      { refreshToken: refreshToken },
      { where: { id: Finduser.id } }
    );

    // Set the access token as a cookie (HTTP-only cookie for security)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production 
      sameSite: 'Strict', // Prevent CSRF attacks      
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Optionally, set the refresh token as a cookie (HTTP-only cookie for security)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production 
      sameSite: 'Strict', // Prevent CSRF attacks      
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Decrypt user data if necessary
    // const decryptedUserData = decryptUserData(Finduser);

    // console.log('d ::d',decryptedUserData);
    return res.status(200).json({
      message: "Login successful",
      // user: decryptedUserData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }finally{
    //await closeConnection();
  }
};

// Profile function
const Profile = async (req, res) => {
  try {
    //await openconnection();
    const id = req.user.userId; // Extract user ID from the request (e.g., from middleware)

    // Query the user while excluding sensitive fields
    const user = await User.findOne({
      where: { id },
      attributes: [
        "FullName",
        "Email",
        "Phone",
        "Account_Type",
        "Address",
        "documentType",
        "documentNumber",
        "AccountID",
        "ReferralID",
      ],
    });

    // Check if a user was found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Encrypted user details:", user.toJSON());

    // Decrypt user data
    const decryptedUserData = decryptUserData(user.toJSON());
    decryptedUserData.AccountID = user.AccountID; // Ensure IDs remain unchanged
    decryptedUserData.ReferralID = user.ReferralID;

    console.log("Decrypted user details:", decryptedUserData);

    // Return the decrypted user data
    return res.json(decryptedUserData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error", error });
  }finally{
    //await closeConnection();
  }
};

// Update Profile function
const UpdateProfile = async (req, res) => {
  try {
    //await openconnection();
    const id = req.user.userId; // Ensure this comes from JWT middleware
    const updates = encryptUserData(req.body); // Encrypt incoming data

    console.log('Updating user with ID:', id);
    console.log('Updates:', updates);

    // Update the user's profile with the provided data
    const [affectedRows] = await User.update(
      {
        FullName: updates.FullName,
        Phone: updates.Phone,
        Account_Type: updates.Account_Type,
        Address: updates.Address,
        documentType: updates.documentType,
        documentNumber: updates.documentNumber,
      },
      {
        where: { id },
        individualHooks: true, //Ensure hooks run if any (e.g., data validation or transformations)
      }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the updated user
    const updatedUser = await User.findOne({
      where: { id },
      attributes: [
        "FullName",
        "Email",
        "Phone",
        "Account_Type",
        "Address",
        "documentType",
        "documentNumber",
        "AccountID",
        "ReferralID",
      ],
    });
    const decryptedUpdatedUserData = decryptUserData(updatedUser.toJSON());
    return res.json({ message: "Profile updated successfully", user: decryptedUpdatedUserData });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Server error", error });
  }finally{
    //await closeConnection();
  }
};

const KYCUpdate = async (req, res) => {
  try {
    //await openconnection();
    const id = req.user.userId; // Extract user ID from the authenticated request
    const { documentType, documentNumber } = req.body;

    // Validate input
    if (!documentType || !documentNumber) {
      return res.status(400).json({ message: "Document type and number are required" });
    }

    // Encrypt the new KYC details
    const encryptedDocumentType = encrypt(documentType);
    const encryptedDocumentNumber = encrypt(documentNumber);

    // Check if the user exists
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the KYC details
    const submissionDate = new Date(); // Current date for submission
    const KYCStatus = "pending"; // Set status to pending

    await user.update({
      documentType: encryptedDocumentType,
      documentNumber: encryptedDocumentNumber,
      submissionDate,
      KYC_Status: KYCStatus,
    });

    // Respond with success
    return res.status(200).json({
      message: "KYC submitted successfully",
      KYCStatus,
      submissionDate,
    });
  } catch (error) {
    console.error("Error during KYC update:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }finally{
    //await closeConnection();
  }
};

const ChangePassword = async (req, res) => {
  try {
    //await openconnection();
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
    console.log('same same');

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
  }finally{
    //await closeConnection();
  }
};

const ForgetPassword = async (req, res) => {
  try {
    //await openconnection();
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

    const resetLink = `http://localhost:3000/resetPassword/${resetToken}`;

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
  }finally{
    //await closeConnection();
  }
};

const ResetPassword = async (req, res, next) => {
  try {
    //await openconnection();
    const { token } = req.params;
    // const id = req.user.userId; // Extract user ID from the authenticated request
    console.log(id)
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }

    // Verify the token and extract the user's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded Token:", decoded);

    // Find the user by ID
    const user = await User.findOne({ where: { id: decoded.userId } });
    console.log("users",user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const randomStringOne = generateRandomString(5);
    const randomStringTwo = generateRandomString(10);
    // Hash the new password
    const iv = crypto.randomBytes(12).toString('hex');
    console.log(iv);
    const securedIv = randomStringOne + iv + randomStringTwo;
    console.log(securedIv);
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
  }finally{
    //await closeConnection();
  }
};

// Logout Function
const Logout = async (req, res) => {
  try {
    //await openconnection();
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
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }finally{
    //await closeConnection();
  }
};

export { Register, Login, Profile, UpdateProfile, ChangePassword, ForgetPassword, ResetPassword, KYCUpdate, Logout };


// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { encrypt, decrypt } from "../lib/encryptDecrypt.js";
// import { generateAccountID, generateReferralID } from "../lib/uidGeneration.js";
// import { RESPONSE_MESSAGES } from "../lib/constants.js";
// import { encryptPassword, generateRandomString } from "../lib/encryptDecryptPassword.js"
// import nodemailer from 'nodemailer';
// import User from "../models/User.js";
// import crypto from 'crypto';
// // import { openConnection, closeConnection } from "../config/sqlconnection.js";

// dotenv.config(); // Load environment variables

// // Function to generate tokens
// const generateTokens = (userId, AccountID) => {
//   const accessToken = jwt.sign({ userId, AccountID }, process.env.JWT_SECRET, { expiresIn: "50m" });
//   const refreshToken = jwt.sign({ userId, AccountID }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
//   const encryptedAccessToken = encrypt(accessToken)
//   const encryptedRefreshToken = encrypt(refreshToken)
//   return { encryptedAccessToken, encryptedRefreshToken };
// };

// // Function to encrypt user data
// const encryptUserData = (userData) => {
//   return {
//     FullName: encrypt(userData.FullName),
//     Phone: encrypt(userData.Phone),
//     Account_Type: encrypt(userData.Account_Type),
//     Address: encrypt(userData.Address),
//     documentType: encrypt(userData.documentType),
//     documentNumber: encrypt(userData.documentNumber)
//   };
// };

// // Function to decrypt user data
// const decryptUserData = (encryptedData) => {
//   return {
//     FullName: decrypt(encryptedData.FullName),
//     Phone: decrypt(encryptedData.Phone),
//     Account_Type: decrypt(encryptedData.Account_Type),
//     Address: decrypt(encryptedData.Address),
//     documentType: decrypt(encryptedData.documentType),
//     documentNumber: decrypt(encryptedData.documentNumber),
//   };
// };

// // Register function
// const Register = async (req, res) => {
//   try {
//     //await openconnection();    
//     const { FullName, Email, Password, Phone, Account_Type, Address, documentType, documentNumber } = req.body;

//     // Check if the user already exists in the database
//     const existingUser = await User.findOne({ where: { Email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Encrypt user data
//     const encryptedUserData = encryptUserData({ FullName, Email, Phone, Account_Type, Address, documentType, documentNumber });
//     const randomStringOne = generateRandomString(5);
//     const randomStringTwo = generateRandomString(10);

//     const iv = crypto.randomBytes(12).toString('hex');
//     console.log(iv);
//     const securedIv = randomStringOne + iv + randomStringTwo;
//     console.log(securedIv);
//     const encryptedPassword = encryptPassword(Password, iv)
//     console.log("encrypted password", encryptedPassword);

//     // Generate unique AccountID and ReferralID
//     const AccountID = generateAccountID();
//     const ReferralID = generateReferralID(FullName);
//     const newUser = await User.create({
//       FullName: encryptedUserData.FullName,
//       Email: Email, // Email is not encrypted for uniqueness checks
//       Password: encryptedPassword,
//       Phone: encryptedUserData.Phone,
//       Account_Type: encryptedUserData.Account_Type,
//       Address: encryptedUserData.Address,
//       documentType: encryptedUserData.documentType,
//       documentNumber: encryptedUserData.documentNumber,
//       AccountID,
//       ReferralID,
//       iv: securedIv,
//     });
//     if (newUser) {
//       res.status(201).json({ message: "User registered successfully", AccountID, ReferralID });
//     } else {
//       res.status(500).json({ message: "Failed to register user" });
//     }
//   } catch (error) {
//     console.error("Error during user registration:", error);
//     res.status(500).json({ message: "Internal server error" });
//   } finally{
//     //await closeConnection();
//   }
// };

// // Login function
// const Login = async (req, res) => {
//   try {
//     //await openconnection();
//     const { Email, Password } = req.body;

//     // Check if email and password are provided
//     if (!Email || !Password) {
//       return res.status(400).json({ message: RESPONSE_MESSAGES.BAD_REQUEST.message });
//     }

//     // Find the user by email using Sequelize
//     const Finduser = await User.findOne({ where: { Email } });
    
//     if (!Finduser) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const realIv = Finduser.iv.substring(5, 29); // Extract the IV from stored data
//     const encryptedPass = encryptPassword(Password, realIv);
//     const storedPassword = Finduser.Password;

//     console.log(encryptedPass)
//     console.log(storedPassword)
//     console.log("sdf",Finduser.Password)
//     if (encryptedPass !== storedPassword){
//       return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID.message });

//     }

//     // Generate tokens
//     const { encryptedAccessToken, encryptedRefreshToken } = generateTokens(Finduser.id, Finduser.AccountID);

//     // Update the refresh token in the database
//     await User.update(
//       { refreshToken: encryptedRefreshToken },
//       { where: { id: Finduser.id } }
//     );

//     // Set the access token as a cookie (HTTP-only cookie for security)
//     res.cookie("accessToken", encryptedAccessToken, {
//       httpOnly: true,
//       secure: false, // Set to `true` in production if using HTTPS
//       maxAge: 50 * 60 * 1000, // 50 minutes
//     });

//     // Optionally, set the refresh token as a cookie (HTTP-only cookie for security)
//     res.cookie("refreshToken", encryptedRefreshToken, {
//       httpOnly: true,
//       secure: false, // Set to `true` in production if using HTTPS
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     // Decrypt user data if necessary
//     // const decryptedUserData = decryptUserData(Finduser);

//     // console.log('d ::d',decryptedUserData);
//     return res.status(200).json({
//       message: "Login successful",
//       // user: decryptedUserData,
//       encryptedAccessToken,
//       encryptedRefreshToken,
//     });
//   } catch (error) {
//     console.error("Error during user login:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }finally{
//     //await closeConnection();
//   }
// };

// // Profile function
// const Profile = async (req, res) => {
//   try {
//     //await openconnection();
//     const id = req.user.userId; // Extract user ID from the request (e.g., from middleware)

//     // Query the user while excluding sensitive fields
//     const user = await User.findOne({
//       where: { id },
//       attributes: [
//         "FullName",
//         "Email",
//         "Phone",
//         "Account_Type",
//         "Address",
//         "documentType",
//         "documentNumber",
//         "AccountID",
//         "ReferralID",
//       ],
//     });

//     // Check if a user was found
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log("Encrypted user details:", user.toJSON());

//     // Decrypt user data
//     const decryptedUserData = decryptUserData(user.toJSON());
//     decryptedUserData.AccountID = user.AccountID; // Ensure IDs remain unchanged
//     decryptedUserData.ReferralID = user.ReferralID;

//     console.log("Decrypted user details:", decryptedUserData);

//     // Return the decrypted user data
//     return res.json(decryptedUserData);
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }finally{
//     //await closeConnection();
//   }
// };

// // Update Profile function
// const UpdateProfile = async (req, res) => {
//   try {
//     //await openconnection();
//     const id = req.user.userId; // Ensure this comes from JWT middleware
//     const updates = encryptUserData(req.body); // Encrypt incoming data

//     console.log('Updating user with ID:', id);
//     console.log('Updates:', updates);

//     // Update the user's profile with the provided data
//     const [affectedRows] = await User.update(
//       {
//         FullName: updates.FullName,
//         Phone: updates.Phone,
//         Account_Type: updates.Account_Type,
//         Address: updates.Address,
//         documentType: updates.documentType,
//         documentNumber: updates.documentNumber,
//       },
//       {
//         where: { id },
//         individualHooks: true, //Ensure hooks run if any (e.g., data validation or transformations)
//       }
//     );

//     if (affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Fetch the updated user
//     const updatedUser = await User.findOne({
//       where: { id },
//       attributes: [
//         "FullName",
//         "Email",
//         "Phone",
//         "Account_Type",
//         "Address",
//         "documentType",
//         "documentNumber",
//         "AccountID",
//         "ReferralID",
//       ],
//     });
//     const decryptedUpdatedUserData = decryptUserData(updatedUser.toJSON());
//     return res.json({ message: "Profile updated successfully", user: decryptedUpdatedUserData });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }finally{
//     //await closeConnection();
//   }
// };

// const KYCUpdate = async (req, res) => {
//   try {
//     //await openconnection();
//     const id = req.user.userId; // Extract user ID from the authenticated request
//     const { documentType, documentNumber } = req.body;

//     // Validate input
//     if (!documentType || !documentNumber) {
//       return res.status(400).json({ message: "Document type and number are required" });
//     }

//     // Encrypt the new KYC details
//     const encryptedDocumentType = encrypt(documentType);
//     const encryptedDocumentNumber = encrypt(documentNumber);

//     // Check if the user exists
//     const user = await User.findOne({ where: { id } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update the KYC details
//     const submissionDate = new Date(); // Current date for submission
//     const KYCStatus = "pending"; // Set status to pending

//     await user.update({
//       documentType: encryptedDocumentType,
//       documentNumber: encryptedDocumentNumber,
//       submissionDate,
//       KYC_Status: KYCStatus,
//     });

//     // Respond with success
//     return res.status(200).json({
//       message: "KYC submitted successfully",
//       KYCStatus,
//       submissionDate,
//     });
//   } catch (error) {
//     console.error("Error during KYC update:", error);
//     return res.status(500).json({ message: "Internal server error", error });
//   }finally{
//     //await closeConnection();
//   }
// };

// const ChangePassword = async (req, res) => {
//   try {
//     //await openconnection();
//     const id = req.user.userId; // Extract user ID from the authenticated request
//     const { oldPassword, newPassword } = req.body;

//     // Validate input
//     if (!oldPassword || !newPassword) {
//       return res.status(400).json({ message: "Old password and new password are required" });
//     }

//     // Fetch the user by ID
//     const Finduser = await User.findOne({ where: { id } });
//     if (!Finduser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const realIv = Finduser.iv.substring(5, 29); // Extract the IV from stored data
//     const encryptedPass = encryptPassword(oldPassword, realIv);
//     const storedPassword = Finduser.Password;

//     if (encryptedPass !== storedPassword) {
//       return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID.message });
//     }
//     console.log('same same');

//     const randomStringOne = generateRandomString(5);
//     const randomStringTwo = generateRandomString(10);
//     // Hash the new password
//     const iv = crypto.randomBytes(12).toString('hex');
//     console.log(iv);
//     const securedIv = randomStringOne + iv + randomStringTwo;
//     console.log(securedIv);
//     const hashedNewPassword = encryptPassword(newPassword, iv)
//     // Update the password in the database
//     await Finduser.update({ Password: hashedNewPassword, iv: securedIv });

//     // Respond with success
//     return res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("Error during password change:", error);
//     return res.status(500).json({ message: "Internal server error", error });
//   }finally{
//     //await closeConnection();
//   }
// };

// const ForgetPassword = async (req, res) => {
//   try {
//     //await openconnection();
//     const { Email } = req.body;

//     // Validate input
//     if (!Email) {
//       return res.status(400).json({ message: "Email is required." });
//     }

//     // Find the user by email using Sequelize
//     const user = await User.findOne({ where: { Email } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log("User ID:", user.id);

//     // Generate a JWT reset token
//     const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "10m",
//     });

//     const resetLink = `http://localhost:3000/resetPassword/${resetToken}`;

//     // Configure Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Mail options
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: Email,
//       subject: "Password Reset Request",
//       text: `Click the link to reset your password: ${resetLink}`,
//     };

//     // Send the email
//     await transporter.sendMail(mailOptions);

//     // Respond with success message
//     return res
//       .status(200)
//       .json({ message: "Password reset link sent to email." });
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     return res.status(500).json({ message: "Internal server error.", error });
//   }finally{
//     //await closeConnection();
//   }
// };

// const ResetPassword = async (req, res, next) => {
//   try {
//     //await openconnection();
//     const { token } = req.params;
//     // const id = req.user.userId; // Extract user ID from the authenticated request
//     console.log(id)
//     const { newPassword } = req.body;

//     // Validate input
//     if (!newPassword) {
//       return res.status(400).json({ message: "New password is required." });
//     }

//     // Verify the token and extract the user's ID
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     console.log("Decoded Token:", decoded);

//     // Find the user by ID
//     const user = await User.findOne({ where: { id: decoded.userId } });
//     console.log("users",user)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Hash the new password
//     const randomStringOne = generateRandomString(5);
//     const randomStringTwo = generateRandomString(10);
//     // Hash the new password
//     const iv = crypto.randomBytes(12).toString('hex');
//     console.log(iv);
//     const securedIv = randomStringOne + iv + randomStringTwo;
//     console.log(securedIv);
//     const hashedNewPassword = encryptPassword(newPassword, iv)
//     // Update the user's password
//     await user.update({ Password: hashedNewPassword, iv: securedIv });

//     res.status(200).json({ message: "Password has been reset successfully." });
//   } catch (error) {
//     console.error("Reset Password Error:", error);

//     // Handle JWT errors
//     if (error.name === "TokenExpiredError") {
//       return res.status(400).json({ message: "Reset token expired." });
//     } else if (error.name === "JsonWebTokenError") {
//       return res.status(400).json({ message: "Invalid token." });
//     }

//     // Pass other errors to the global error handler
//     next(error);
//   }finally{
//     //await closeConnection();
//   }
// };

// // Logout Function
// const Logout = async (req, res) => {
//   try {
//     //await openconnection();
//     const { refreshToken } = req.cookies;

//     // Check if the refresh token is provided
//     if (!refreshToken) {
//       return res.status(400).json({ message: "No token provided" });
//     }

//     // Verify the refresh token
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//     if (!decoded) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // Find the user using the decoded user ID from the refresh token
//     const Finduser = await User.findOne({ where: { id: decoded.userId } });
//     if (!Finduser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update the user's refresh token to NULL
//     await Finduser.update({ refreshToken: null });

//     // Clear cookies
//     res.clearCookie("accessToken");
//     res.clearCookie("refreshToken");

//     return res.status(200).json({ message: "Logout successful" });
//   } catch (error) {
//     console.error("Error during logout:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }finally{
//     //await closeConnection();
//   }
// };

// export { Register, Login, Profile, UpdateProfile, ChangePassword, ForgetPassword, ResetPassword, KYCUpdate, Logout };

