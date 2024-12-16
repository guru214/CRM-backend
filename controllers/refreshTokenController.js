import jwt from 'jsonwebtoken';
import { connectDB, closeDB } from '../config/mongodb.js';
const RefreshToken = async (req, res) => {
  try {
    await connectDB();
    // Make sure you are using cookie-parser and accessing req.cookies
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      const { userId, AccountID } = decoded;

      // Generate a new access token
      const newAccessToken = jwt.sign({ userId, AccountID }, process.env.JWT_SECRET, { expiresIn: "60m" });

      // Set the new access token as a cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false, // Set to `true` in production if using HTTPS
        maxAge: 60 * 60 * 1000, // 60 minutes
      });

      res.status(200).json({ message: "Access token refreshed", accessToken: newAccessToken, userId, AccountID });
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    res.status(500).json({ message: "Internal server error" });
  }finally{
    await closeDB();
  }
};



export default RefreshToken;