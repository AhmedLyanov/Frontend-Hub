import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import transporter from "../config/mailer.js";

function generateToken(user) {
  console.log(process.env.JWT_SECRET);
  
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
        return res.status(400).json({ message: "This user already exists!" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        firstName,
        lastName,
        patronymic,
        email,
        password: hashedPassword,
        phoneNumber,
      };
      if (req.file && req.file.filename) {
        newUser.avatar = req.file.filename;
      }

      const user = new User(newUser);
      const token = generateToken(user);
      await user.save();

      await transporter.sendMail({
        from: 'Workout <amoshal1997@gmail.com>',
        to: email,
        subject: "Добро пожаловать!",
        text: "тестовое сообщение приветсвия",
        html: `<p>Вы зарегистрировались в workout</p>`
      })
      return res.status(201).json({ message: user, token });
    } catch (error) {
      console.error("Registration error:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if(!email || !password) {
        res.status(400).json({ message: "Не все поля заполнены" })
      }

      const user = await User.findOne({ email })
      if(!user) {
        res.status(400).json({ message: "Неправильная почта" })
      }

      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) {
        return res.status(400).json({ message: "Непарвильный пароль" });
      }

      const token = generateToken(user);

      return res.status(201).json({ message: "Вы успешно вошли!", token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Ошибка при входе" })
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
      const userUsers = await User.find({ roles: "user"});
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
}

export default new AuthController();
