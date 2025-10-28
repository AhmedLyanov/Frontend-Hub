import { Router } from "express";
import { createResume, deleteResume, getResume, getResumes, updateResume } from "../controllers/resume.controller.js";

const resumeRouter = Router();

resumeRouter.get("/", getResumes);
resumeRouter.get("/:id", getResume);
resumeRouter.post("/", createResume);
resumeRouter.put("/:id", updateResume);
resumeRouter.delete("/:id", deleteResume);


export default resumeRouter;