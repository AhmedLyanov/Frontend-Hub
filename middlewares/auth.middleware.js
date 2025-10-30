import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { JWT_CONFIG } from "../config/jwt.config.js";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid", error });
  }
};

export default authMiddleware;
