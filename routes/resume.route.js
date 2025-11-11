import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { handleValidationErrors } from "../middleware/error.middleware.js";
import { createResumeValidation, updateResumeValidation } from "../middleware/validators/resume.validator.js";
import { createResume, deleteResume, getResume, getResumes, updateResume } from "../controllers/resume.controller.js";


const resumeRouter = Router();

resumeRouter.get("/", getResumes);
resumeRouter.get("/:resumeId", getResume);
resumeRouter.post("/", authMiddleware, createResumeValidation, handleValidationErrors, createResume);
resumeRouter.put("/:resumeId", authMiddleware, updateResumeValidation, handleValidationErrors, updateResume);
resumeRouter.delete("/:resumeId", authMiddleware, deleteResume);

export default resumeRouter;