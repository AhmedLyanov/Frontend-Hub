import { Schema, model } from "mongoose";

const WorkExperienceSchema = new Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    period: { type: String, required: true },
    achievements: { type: String }
}, { _id: false });

const EducationSchema = new Schema({
    degree: { type: String, required: true },
    field: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true }
}, { _id: false });

const LanguageSchema = new Schema({
    language: { type: String, required: true },
    level: { type: String, required: true, enum: [ "Beginner", "Intermediate", "Advanced", "Native" ] }
}, { _id: false });

const ResumeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    contacts: {
      email: { type: String, required: true },
      phone: { type: String },
      linkedin: { type: String },
      github: { type: String }
    },
    workExperience: [ WorkExperienceSchema ],
    education: [ EducationSchema ],
    skills: [{ type: String }],
    languages: [ LanguageSchema ],
    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ResumeSchema.index({ userId: 1 });
ResumeSchema.index({ isPublic: 1 });

export default model("Resume", ResumeSchema);