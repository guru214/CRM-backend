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
    if (user.isEmailVerified !== "Yes") {
        const emailVerifyToken = jwt.sign({ Email: userEmail }, process.env.JWT_SECRET_KEY, {
          expiresIn: "10m",
        });
    
        const emailVerifyLink = `https://crm-backend-onw8.onrender.com/verifyEmail/${emailVerifyToken}`;
    
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
          to: userEmail,
          subject: "Email Verification Request",
          text: `Click the link to verify your Email: ${emailVerifyLink}`,
        };
    
        // Send the email
        await transporter.sendMail(mailOptions);
    
        // Respond with success message
        return res
          .status(200)
          .json({ message: "Email link sent to email." });
      }
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in email verification middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default isEmailVerified;
