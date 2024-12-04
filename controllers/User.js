import jwt from "jsonwebtoken";
import mySqlPool from "../config/db.js";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import { encrypt, decrypt } from "../middleware/encryptDecrypt.js";
import nodemailer from 'nodemailer';

dotenv.config(); // Load environment variables

// Function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "50m" });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// Function to encrypt user data
const encryptUserData = (userData) => {
  return {
    FullName: encrypt(userData.FullName),
    Phone: encrypt(userData.Phone),
    Account_Type: encrypt(userData.Account_Type),
    Address: encrypt(userData.Address),
    documentType: encrypt(userData.documentType),
    documentNumber: encrypt(userData.documentNumber)
  };
};

// Function to decrypt user data
const decryptUserData = (encryptedData) => {
  return {
    FullName: decrypt(encryptedData.FullName),
    Phone: decrypt(encryptedData.Phone),
    Account_Type: decrypt(encryptedData.Account_Type),
    Address: decrypt(encryptedData.Address),
    documentType: decrypt(encryptedData.documentType),
    documentNumber: decrypt(encryptedData.documentNumber),
  };
};

// Generate Account ID: Random 12 digits starting with "10"
const generateAccountID = () => {
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); // 9 random digits
  return `10${randomDigits}`; // Prefix "10"
};

// Generate Referral ID: First 2 letters of FullName + 4 random numbers + Last 2 letters of FullName
const generateReferralID = (fullName) => {
  const sanitizedFullName = fullName.replace(/\s+/g, ""); // Remove spaces if any
  if (sanitizedFullName.length < 4) {
    throw new Error("Full name must be at least 4 characters long");
  }
  const firstFour = sanitizedFullName.substring(0, 4).toUpperCase(); // First 4 letters
  // const lastTwo = sanitizedFullName.substring(sanitizedFullName.length - 2).toUpperCase(); // Last 2 letters
  const randomNumbers = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `${firstFour}${randomNumbers}`;
};

// Generate unique Account ID
const generateUniqueAccountID = async () => {
  let isUnique = false;
  let accountID;

  while (!isUnique) {
    accountID = generateAccountID(); // Call the Account ID generator
    const [rows] = await mySqlPool.query("SELECT COUNT(*) AS count FROM users WHERE AccountID = ?", [accountID]);
    if (rows[0].count === 0) {
      isUnique = true; // No duplicate found
    }
  }

  return accountID;
};

// Generate unique Referral ID
const generateUniqueReferralID = async (fullName) => {
  let isUnique = false;
  let referralID;

  while (!isUnique) {
    referralID = generateReferralID(fullName); // Call the Referral ID generator
    const [rows] = await mySqlPool.query("SELECT COUNT(*) AS count FROM users WHERE ReferralID = ?", [referralID]);
    if (rows[0].count === 0) {
      isUnique = true; // No duplicate found
    }
  }

  return referralID;
};


// Register function
const Register = async (req, res) => {
  try {
    const { FullName, Email, Password, Phone, Account_Type, Address, documentType, documentNumber } = req.body;

    // Check if the user already exists in the database
    const [existingUser] = await mySqlPool.query("SELECT * FROM users WHERE Email = ?", [Email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt user data
    const encryptedUserData = encryptUserData({ FullName, Email, Phone, Account_Type, Address, documentType, documentNumber });
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Generate unique AccountID and ReferralID
    const AccountID = await generateUniqueAccountID();
    const ReferralID = await generateUniqueReferralID(FullName);

    // Insert new user into the database
    const [result] = await mySqlPool.query(
      `INSERT INTO users (FullName, Email, Password, Phone, Account_Type, Address, documentType, documentNumber, AccountID, ReferralID) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [encryptedUserData.FullName, Email, hashedPassword, encryptedUserData.Phone, encryptedUserData.Account_Type, encryptedUserData.Address, encryptedUserData.documentType, encryptedUserData.documentNumber, AccountID, ReferralID]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ message: "User registered successfully", AccountID, ReferralID });
    } else {
      res.status(500).json({ message: "Failed to register user" });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Login function
const Login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Check if email and password are provided
    if (!Email || !Password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if the user exists in the database
    const [rows] = await mySqlPool.query("SELECT * FROM users WHERE Email = ?", [Email]);
    const Finduser = rows[0];
    console.log(Finduser)

    if (!Finduser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(Password, Finduser.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate both access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(Finduser.id);

    // Store the refresh token in the database (e.g., update user record with refresh token)
    await mySqlPool.query("UPDATE users SET refreshToken = ? WHERE id = ?", [refreshToken, Finduser.id]);

    // Set the access token as a cookie (HTTP-only cookie for security)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // Set to `true` in production if using HTTPS
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Optionally, set the refresh token as a cookie (HTTP-only cookie for security)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to `true` in production if using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Decrypt user data before sending the response
    const decryptedUserData = decryptUserData(Finduser);

    // Respond with success and return the user data and tokens
    return res.status(200).json({
      message: "Login successful",
      user: decryptedUserData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Profile function
const Profile = async (req, res) => {
  try {
    const id  = req.user.userId;

    // Query to select the user excluding the password and tokens
    const [rows] = await mySqlPool.query(
      "SELECT FullName, Email, Phone, Account_Type, Address, documentType, documentNumber, AccountID, ReferralID FROM users WHERE id = ?",
      [id]
    );

    console.log("Encrypted user details:", rows[0]);

    // Check if a user was found
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Decrypt user data
    const decryptedUserData = decryptUserData(rows[0]);
    decryptedUserData.AccountID = rows[0].AccountID;
    decryptedUserData.ReferralID = rows[0].ReferralID;
    console.log("Decrypted user details:", decryptedUserData);

    // Return the user data
    res.json(decryptedUserData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

   // Update Profile function
   const UpdateProfile = async (req, res) => {
     try {
       const id  = req.user.userId; // Get user ID from request parameters
       const updates = encryptUserData(req.body); // Encrypt updates from request body

       // Build the query
       const query = `
         UPDATE users 
         SET 
           FullName = COALESCE(?, FullName), 
           Phone = COALESCE(?, Phone), 
           Account_Type = COALESCE(?, Account_Type), 
           Address = COALESCE(?, Address), 
           documentType = COALESCE(?, documentType), 
           documentNumber = COALESCE(?, documentNumber) 
         WHERE id = ?`;

       // Execute the query schema
       const [result] = await mySqlPool.query(query, [
         updates.FullName,
         updates.Phone,
         updates.Account_Type,
         updates.Address,
         updates.documentType,
         updates.documentNumber,
         id
       ]);

       // Check if any rows were affected
       if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'User not found' });
       }

       // Fetch the updated user to send back in the response
       const [updatedUser] = await mySqlPool.query("SELECT * FROM users WHERE id = ?", [id]);

       // Decrypt updated user data before sending the response
       const decryptedUpdatedUserData = decryptUserData(updatedUser[0]);

       res.json({ message: 'Profile updated successfully', user: decryptedUpdatedUserData });
     } catch (error) {
       console.error('Error updating user profile:', error);
       res.status(500).json({ message: 'Server error', error });
     }
   };

   const KYCUpdate = async (req, res) => {
    try {
      const id = req.user.userId; // User ID from the request parameters
      const { documentType, documentNumber } = req.body;
  
      // Validate input
      if (!documentType || !documentNumber) {
        return res.status(400).json({ message: "Document type and number are required" });
      }
  
      // Encrypt the new KYC details
      const encryptedDocumentType = encrypt(documentType);
      const encryptedDocumentNumber = encrypt(documentNumber);
  
      // Check if the user exists
      const [userResult] = await mySqlPool.query("SELECT id FROM users WHERE id = ?", [id]);
      if (userResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update the KYC details
      const submissionDate = new Date(); // Current date for submission
      const KYCStatus = "pending"; // Set status to pending
  
      const updateQuery = `
        UPDATE users 
        SET 
          documentType = ?, 
          documentNumber = ?, 
          submissionDate = ?, 
          KYC_Status = ? 
        WHERE id = ?`;
  
      // Execute the update query
      await mySqlPool.query(updateQuery, [
        encryptedDocumentType,
        encryptedDocumentNumber,
        submissionDate,
        KYCStatus,
        id,
      ]);
  
      // Respond with success
      return res.status(200).json({
        message: "KYC submitted successfully",
        KYCStatus: "pending",
        submissionDate,
      });
    } catch (error) {
      console.error("Error during KYC update:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  };
  
  const ChangePassword = async (req, res) => {
    try {
      const id = req.user.userId; // User ID from request parameters
      const { oldPassword, newPassword } = req.body;
  
      // Validate input
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Old password and new password are required" });
      }
  
      // Fetch the user by ID
      const [userResult] = await mySqlPool.query("SELECT Password FROM users WHERE id = ?", [id]);
      if (userResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const hashedOldPassword = userResult[0].Password;
  
      // Validate the old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, hashedOldPassword);
      if (!isOldPasswordValid) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the password in the database
      await mySqlPool.query("UPDATE users SET Password = ? WHERE id = ?", [hashedNewPassword, id]);
  
      // Respond with success
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error during password change:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  };
  
  const ForgetPassword = async (req, res) => {
    try {
        const { Email } = req.body;


        const [user] = await mySqlPool.query("SELECT * FROM users WHERE Email = ?",[Email])
        const FindUser = user[0];
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // const userId = req.user.userId;
        console.log("userId:",FindUser.id)

        const resetToken = jwt.sign({ id: FindUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '10m' });
       
        const resetLink = `http://localhost:3000/resetPassword/${resetToken}`;

        // it's Nodemailer setup..
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: Email,
            subject: 'Password Reset Request',
            text: `Click the link to reset your password: ${resetLink}`,
        };

        // we Send email using this predefined method called sendMail 
        await transporter.sendMail(mailOptions); 

        res.status(200).json({ message: "Password reset link sent to email." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
    }
};

const ResetPassword = async (req, res, next) => {
  try {
      const { token } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) {
          return res.status(400).json({ message: "New password is required." });
      }
      // Verify the token and get the user's ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log("Decoded Token:", decoded);

      // Check if the user exists
      const [user] = await mySqlPool.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
      if (!user.length) {
          return res.status(404).json({ message: "User not found" });
      }
      // Update the password in the database
      const hashedPassword = encrypt(newPassword); // Replace this with your hashing logic
      await mySqlPool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);

      res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
      console.error("Reset Password Error:", error);
      if (error.name === 'TokenExpiredError') {
          return res.status(400).json({ message: "Reset token expired." });
      } else if (error.name === 'JsonWebTokenError') {
          return res.status(400).json({ message: "Invalid token." });
      } else {
          next(error);
      }
  }
};


// Logout Function
const Logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    await mySqlPool.query("UPDATE users SET refreshToken = NULL WHERE id = ?", [decoded.userId]);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { Register, Login, Profile, UpdateProfile, ChangePassword, ForgetPassword,ResetPassword, KYCUpdate, Logout };

