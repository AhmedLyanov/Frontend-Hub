import { Router } from "express";
const router = new Router();
import projectController from "../controllers/projectController.js";
// import authMiddleware from "../middlewares/authMiddleware.js";
import upload from '../middlewares/upload.js';

router.get("/allProjects", projectController.getProjects);
router.get("/getProject/:id", projectController.getOneProject);
router.post("/addProject", upload.array('images', 12), projectController.addProject);
router.delete("/delProject/:id", projectController.deleteOneProject);
router.patch("/update/:id", projectController.updateProject);
router.get("/user-projects/:userId", projectController.getUserProjects);

export default router;