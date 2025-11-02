// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export const protect = async (req, res, next) => {
  try {
    // ✅ Check token presence
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // ✅ Extract and verify
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // ✅ Fetch user fresh from DB (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach to request for controller use
    req.user = {
      _id: user._id,
      name: user.name,
      role: user.role || "user",
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
