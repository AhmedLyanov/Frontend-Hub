import { Router } from "express";
const router = new Router();
import projectController from "../controllers/projectController.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from '../middlewares/project-upload.js';

router.get("/allProjects", projectController.getProjects);
router.get("/getProject/:id", authMiddleware, projectController.getOneProject);
router.post("/addProject", authMiddleware, upload.array('images', 12), projectController.addProject);
router.delete("/delProject/:id", authMiddleware, projectController.deleteOneProject);
router.patch("/update/:id", authMiddleware, projectController.updateProject);
router.get("/user-projects/:userId", authMiddleware, projectController.getUserProjects);

export default router;