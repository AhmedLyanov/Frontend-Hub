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
authRouter.post("/login", validateLogin, authController.login);

authRouter.get("/role/admin", authController.getUsersRolesAdmin);
authRouter.get("/role/user", authController.getUsersRolesUser);
authRouter.get("/role/student", authController.getUsersRolesStudent);

export default authRouter;
