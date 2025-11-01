import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.GMAIL_USER_TEST,
        pass: process.env.GMAIL_PASS_TEST
    }
})

export default transporter;