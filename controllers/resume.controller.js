import Resume from "../models/Resume.model.js";

export async function getResumes(req, res){
    try {
        const resumes = await Resume.find();

        res.status(200).json({ resumes });
    } catch (error) {
        res.status(500).json({ message: "Не удалось получить список резюме" });
        console.error(error);
    }
}

export async function getResume(req, res){
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findById(resumeId);

        if(!resume){
            return res.status(404).json({ message: "Резюме не найдено" });
        }

        res.status(200).json({ resume });
    } catch (error) {
        res.status(500).json({ message: "Не удалось получить резюме" });
        console.error(error);
    }
}

export async function createResume(req, res){
    try {
        const { id } = req.user;
        const{
            title,
            summary,
            contacts,
            workExperience,
            education,
            skills,
            languages
        } = req.body;

        await Resume.create({
            userId: id,
            title,
            summary,
            contacts,
            workExperience,
            education,
            skills,
            languages
        });
        
        res.status(200).json({ message: "Резюме успешно добавлено" });
    } catch (error) {
        res.status(500).json({ message: "Не удалось создать резюме" });
        console.error(error);
    }
}

export async function updateResume(req, res){
    try {
        const { id } = req.user;
        const { resumeId } = req.params;
        const{
            title,
            summary,
            contacts,
            workExperience,
            education,
            skills,
            languages
        } = req.body;

        const resume = await Resume.findById(resumeId);

        if(!resume){
            return res.status(404).json({ message: "Резюме не найдено" });
        }

        if(id !== resume.userId){
            return res.status(403).json({ message: "У вас нет доступа" });
        }

        resume.title = title;
        resume.summary = summary;
        resume.contacts = contacts;
        resume.workExperience = workExperience;
        resume.education = education;
        resume.skills = skills;
        resume.languages = languages;

        await resume.save();

        res.status(200).json({ message: "Резюме успешно добавлено" });
    } catch (error) {
        res.status(500).json({ message: "Не удалось обновить резюме" });
        console.error(error);
    }
}

export async function deleteResume(req, res){
    try {
        const { id } = req.user;
        const { resumeId } = req.params;
        const resume = await Resume.findById(resumeId);

        if(!resume){
            return res.status(404).json({ message: "Резюме не найдено" });
        }

        if(id !== resume.userId){
            return res.status(403).json({ message: "У вас нет доступа" });
        }

        await resume.deleteOne();

        res.status(200).json({ message: "Резюме успешно удалено" });
    } catch (error) {
        res.status(500).json({ message: "Не удалось удалить резюме" });
        console.error(error);
    }
}