import jwt from 'jsonwebtoken'
import User from "../models/User.js";
import nodemailer from 'nodemailer'

const isEmailVerified = async (req, res, next) => {
  try {
    const userEmail = req.user?.Email; // Assuming `req.user` is populated by an authentication middleware

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Fetch the user from the database
    const user = await User.findOne({ where: { Email: userEmail } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user's email is verified
    if (user.isEmailVerified !== true) {
      return res.status(403).json({ message: "please verify your email." });
    }
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in email verification middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default isEmailVerified;
