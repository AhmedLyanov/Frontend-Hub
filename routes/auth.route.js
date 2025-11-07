import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import upload from "../config/multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  validateRegistration,
  validateLogin,
} from "../middlewares/validators/auth.validator.js";

const authRouter = Router();

authRouter.post(
  "/registration",
  upload.single("avatar"),
  validateRegistration,
  authController.registration
);

authRouter.post("/send-verify", authController.sendVerificationEmail);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-verify", authController.resendVerificationCode);
authRouter.post("/login", validateLogin, authController.login);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);


authRouter.put("/change-password", authMiddleware, authController.changePassword);
authRouter.put("/change-email", authMiddleware, authController.changeEmail);
authRouter.get("/profile", authMiddleware, authController.getUserProfile);
authRouter.get(
  "/role/admin",
  authMiddleware,
  authController.getUsersRolesAdmin
);
authRouter.get("/role/user", authMiddleware, authController.getUsersRolesUser);
authRouter.get(
  "/role/student",
  authMiddleware,
  authController.getUsersRolesStudent
);

export default authRouter;
