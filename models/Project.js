import { Schema, model } from "mongoose";

const Project = new Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 10
  },
  userId: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
});

export default model("Project", Project);