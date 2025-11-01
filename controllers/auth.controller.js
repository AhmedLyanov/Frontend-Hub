import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
import transporter from "../config/mailer.js";

dotenv.config();

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}

class AuthController {
  async registration(req, res) {
    try {
      const { firstName, lastName, patronymic, email, password, phoneNumber } =
        req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res
          .status(400)
          .json({ message: "Этот пользователь уже существует!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

      const newUser = {
        firstName,
        lastName,
        patronymic,
        email,
        password: hashedPassword,
        phoneNumber,
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpires: verificationCodeExpires,
      };

      if (req.file && req.file.filename) {
        newUser.avatar = req.file.filename;
      }

      const user = new User(newUser);
      await user.save();

      
      await transporter.sendMail({
        from: "Frontend-Hub <amoshal1997@gmail.com>",
        to: email,
        subject: "Подтверждение email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Добро пожаловать в Frontend-Hub!</h2>
            <p>Для завершения регистрации подтвердите ваш email.</p>
            <p>Ваш код подтверждения: <strong style="font-size: 24px; color: #007bff;">${verificationCode}</strong></p>
            <p>Код действителен в течение 10 минут.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">С уважением,<br>Команда Frontend-Hub</p>
          </div>
        `,
      });

      return res.status(201).json({
        message:
          "Регистрация успешна! Код подтверждения отправлен на вашу почту.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async sendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email уже подтвержден" });
      }

      const verification = crypto.randomInt(100000, 999999).toString();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.emailVerification = verification;
      user.emailvErificationExpires = verificationExpires;

      await user.save();
      await transporter.sendMail({
        from: "Frontend-Hub <amoshal1997@gmail.com>",
        to: email,
        subject: "Код подтверждения email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Подтверждение email</h2>
            <p>Ваш код подтверждения: <strong style="font-size: 24px; color: #007bff;">${verificationCode}</strong></p>
            <p>Код действителен в течение 10 минут.</p>
            <p>Если вы не регистрировались в нашем сервисе, проигнорируйте это письмо.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">С уважением,<br>Команда Frontend-Hub</p>
          </div>
        `,
      });

      return res.status(200).json({
        message: "Код подтверждения отправлен на вашу почту",
      });
    } catch (error) {}
  }

  async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email уже подтвержден" });
      }

      
      if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
        return res.status(400).json({ message: "Код не найден или устарел" });
      }

      if (user.emailVerificationCode !== code) {
        return res.status(400).json({ message: "Неверный код подтверждения" });
      }

      if (new Date() > user.emailVerificationCodeExpires) {
        return res.status(400).json({ message: "Срок действия кода истек" });
      }

      
      user.isEmailVerified = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationCodeExpires = undefined;
      await user.save();

      
      const token = generateToken(user);

      return res.status(200).json({
        message: "Email успешно подтвержден!",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error("Verify email error:", error);
      return res.status(500).json({ message: "Ошибка подтверждения email" });
    }
  }

  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email уже подтвержден" });
      }

      
      if (
        user.emailVerificationCodeExpires &&
        new Date(user.emailVerificationCodeExpires.getTime() + 60000) >
          new Date()
      ) {
        return res.status(429).json({
          message: "Повторный запрос можно отправить через 1 минуту",
        });
      }

      
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.emailVerificationCode = verificationCode;
      user.emailVerificationCodeExpires = verificationCodeExpires;
      await user.save();

      
      await transporter.sendMail({
        from: "Frontend-Hub <amoshal1997@gmail.com>",
        to: email,
        subject: "Новый код подтверждения email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Новый код подтверждения</h2>
            <p>Ваш новый код подтверждения: <strong style="font-size: 24px; color: #007bff;">${verificationCode}</strong></p>
            <p>Код действителен в течение 10 минут.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">С уважением,<br>Команда Frontend-Hub</p>
          </div>
        `,
      });

      return res.status(200).json({
        message: "Новый код подтверждения отправлен на вашу почту",
      });
    } catch (error) {
      console.error("Resend verification code error:", error);
      return res.status(500).json({ message: "Ошибка отправки кода" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Не все поля заполнены" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "Неправильная почта" });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Неправильный пароль" });
      }

      const token = generateToken(user);

      return res.status(201).json({ message: "Вы успешно вошли!", token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка при входе" });
    }
  }

  async getUsersRolesAdmin(req, res) {
    try {
      const adminUsers = await User.find({ roles: "admin" });
      return res.status(200).json({
        list: adminUsers.length,
        admins: adminUsers,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Ошибка получения пользователей с ролью admin" });
    }
  }

  async getUsersRolesUser(req, res) {
    try {
      const userUsers = await User.find({ roles: "user" });
      return res.status(200).json({
        list: userUsers.length,
        users: userUsers,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Ошибка получения пользователей с ролью user" });
    }
  }

  async getUsersRolesStudent(req, res) {
    try {
      const studentUsers = await User.find({ roles: "student" });
      return res.status(200).json({
        list: studentUsers.length,
        students: studentUsers,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Ошибка получения пользователей с ролью student" });
    }
  }

  async getUserProfile(req, res) {
    try {
      const { id } = req.user;

      const usersProfile = await User.findById(id);
      if (!usersProfile) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      return res.status(200).json({
        students: usersProfile,
      });
    } catch (error) {
      return res.status(500).json("Не удалось найти");
    }
  }
}

export default new AuthController();
