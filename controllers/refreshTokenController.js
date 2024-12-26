import jwt from 'jsonwebtoken';
import { openConnection, closeConnection } from '../config/sqlconnection.js'; 
const RefreshToken = async (req, res) => {
  try {
    await openConnection();
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

      const { userId, Email, AccountID, Role } = decoded;

      // Generate a new access token
      const newAccessToken = jwt.sign({ userId, Email, AccountID, Role }, process.env.JWT_SECRET, { expiresIn: "60m" });

      // Set the new access token as a cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production 
        sameSite: 'Strict', // Prevent CSRF attacks  
        maxAge: 60 * 60 * 1000, // 60 minutes
      });

      res.status(200).json({ message: "Access token refreshed", accessToken: newAccessToken, userId, Email, AccountID, Role });
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    res.status(500).json({ message: "Internal server error" });
  }finally{
    await closeConnection();
  }
};

export default RefreshToken;