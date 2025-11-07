import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    patronymic: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, unique: true },
    avatar: { type: String },
    roles: { type: [String], default: ["student"] }, //admin or user
    project: {type: [String], default: []},
    resume: {type: [String], default: []},
    isEmailVerified: {type:Boolean, default: false},
    emailVerificationCode: {type: String, default: null},
    emailVerificationCodeExpires: {type: Date, default: null},
    passwordResetCode: { type: String, default: null },
    passwordResetCodeExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model("User", UserSchema);
