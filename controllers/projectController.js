import Project from "../models/Project.js";
import fs from "fs-extra";
import path from "path";

class ProjectController {
  async addProject(req, res) {
    try {
      const { title, description, rating, userId } = req.body;

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
      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({ message: "Проект не найден" });
      }

      if (project.images && project.images.length > 0) {
        for (const imagePath of project.images) {
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

      res.json({
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
      const project = await Project.findById({ _id: id });
      res.json(project);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка при получении проекта" });
    }
  }

  async updateProject(req, res) {
    try {
      const id = req.params.id;
      const { title, description } = req.body;
      const project = await Project.findByIdAndUpdate(
        { _id: id },
        { title: title, description: description }
      );

      res.status(200).json({ message: "Проект изменен" });
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
      const userId = req.params.userId;
      const projects = await Project.find({ userId: userId });
      
      res.json(projects);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка при получении проектов пользователя" });
    }
  }
}

export default new ProjectController();