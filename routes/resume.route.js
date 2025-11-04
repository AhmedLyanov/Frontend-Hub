import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createResumaValidation } from "../middleware/validators/resume.validator.js";
import { createResume, deleteResume, getResume, getResumes, updateResume } from "../controllers/resume.controller.js";

const resumeRouter = Router();

resumeRouter.get("/", getResumes);
resumeRouter.get("/:resumeId", getResume);
resumeRouter.post("/", authMiddleware, createResumaValidation, createResume);
resumeRouter.put("/:resumeId", authMiddleware, updateResume);
resumeRouter.delete("/:resumeId", authMiddleware, deleteResume);


export default resumeRouter;