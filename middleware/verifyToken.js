import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {
    console.log(req.cookies);
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token is required" });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired access token" });
      }

      req.user = decoded; // Contains `userId` or other payload data
      console.log(req.user)
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default verifyToken;
