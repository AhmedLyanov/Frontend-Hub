import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import upload from "../config/multer.js";

const authRouter = Router();

authRouter.post('/registration', upload.single('avatar'), authController.registration);
authRouter.post('/login', authController.login);

// getUsersRole
authRouter.get('/role/admin', authController.getUsersRolesAdmin);
authRouter.get('/role/user', authController.getUsersRolesUser);
authRouter.get('/role/student', authController.getUsersRolesStudent);

export default authRouter;