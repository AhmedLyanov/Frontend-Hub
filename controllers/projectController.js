import Project from "../models/Project.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from 'url';
import User from '../models/User.model.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectController {
  async addProject(req, res) {
    try {
      const { title, description, rating } = req.body;
      const userId = req.user.id;
      let images = [];
      if (req.files && req.files.length > 0) {
        images = req.files.map((file) => file.path);
      } else {
        images = ["uploads/not_img.jpg"];
      }

      const project = new Project({
        title,
        description,
        rating: rating || 0,
        userId,
        images: images,
      });

      if (!userId) {
        return res
          .status(400)
          .json({ message: "Идентификатор автора отсутствует" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      await project.save();
      return res.status(200).json("Проект успешно добавлен!");
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Ошибка добавления проекта" });
    }
  }

  async deleteOneProject(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: "Вы не автор этого проекта" });
      }

      if (project.images && project.images.length > 0) {
        for (const imagePath of project.images) {
          if (imagePath === "uploads/not_img.jpg") {
            continue;
          }

          try {
            const fullPath = path.join(__dirname, "..", imagePath);
            if (await fs.pathExists(fullPath)) {
              await fs.remove(fullPath);
              console.log(`Удален файл: ${fullPath}`);
            }
          } catch (fileError) {
            console.error(`Ошибка при удалении файла ${imagePath}:`, fileError);
          }
        }
      }

      const deletedProject = await Project.findByIdAndDelete(id);

      res.status(200).json({
        message: "Проект удалён",
        project: deletedProject,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка при удалении проекта" });
    }
  }

  async getProjects(req, res) {
    try {
      const projects = await Project.find();
      res.json(projects);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка при получении проектов" });
    }
  }

  async getOneProject(req, res) {
    try {
      const id = req.params.id;
      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      res.json(project);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка при получении проекта" });
    }
  }

  async updateProject(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const { title, description } = req.body;

      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: "Вы не автор этого проекта" });
      }

      res.status(200).json({
        message: "Проект изменен",
        project
      });
    } catch (e) {
      res.status(500).json({ message: "Ошибка при изменении проекта" });
    }
  }

  //    async getUserProjects(req, res) {
  //     try {
  //       const userId = req.user.id;
  //       const projects = await Project.find({ userId: userId }).sort({ createdAt: -1 });
  //       res.json(posts);
  //     } catch (e) {
  //       console.error(e);
  //       res
  //         .status(500)
  //         .json({ message: "Ошибка при получении объявлений пользователя" });
  //     }
  //   }

  // Функция выше должен работать если есть jwt авторизация, у меня этого нет поэтому id добовлял в ручную. И для проверки Функция ниже

  async getUserProjects(req, res) {
    try {
      const userId = req.user.id;
      const projects = await Project.find({ userId: userId });

      res.json(projects);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка при получении проектов пользователя" });
    }
  }
}

export default new ProjectController();