import jwt from 'jsonwebtoken';
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
import { openConnection, closeConnection } from '../../config/sqlconnection.js'; 
import { decrypt, encrypt } from '../../lib/EncryptDecrypt/encryptDecrypt.js';
const RefreshToken = async (req, res) => {
  try {
    await openConnection();
    // Make sure you are using cookie-parser and accessing req.cookies
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is required" });
    }

    const decryptedRefreshToken = decrypt(refreshToken)

    // Verify the refresh token
    jwt.verify(decryptedRefreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      const { userId, Email, AccountID, Role, isEmailVerified } = decoded;

      // Generate a new access token
      const accessToken = jwt.sign({ userId, Email, AccountID, Role, isEmailVerified }, process.env.JWT_SECRET, { expiresIn: "60m" });

      const encryptedNewAccessToken = encrypt(accessToken);
      // Set the new access token as a cookie
      res.cookie("accessToken", encryptedNewAccessToken, {
        httpOnly: true,
        secure: true, // Use secure cookies in production 
        sameSite: 'None', // Prevent CSRF attacks  
        maxAge: 60 * 60 * 1000, // 60 minutes
      });

      res.status(200).json({ message: "Access token refreshed:", accessToken: encryptedNewAccessToken });
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    res.status(500).json({ message: "Internal server error" });
  }finally{
    await closeConnection();
  }
};

export default RefreshToken;
