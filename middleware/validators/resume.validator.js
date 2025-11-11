import { body } from "express-validator";

export const createResumeValidation = [
    body("title")
        .notEmpty()
        .withMessage("Название обязательно")
        .isLength({ max: 100 })
        .withMessage("Название должно быть не длиннее 100 символов"),
    body("description")
        .notEmpty()
        .withMessage("Описание обязательно")
        .isLength({ max: 2000 })
        .withMessage("Описание должно быть не длиннее 2000 символов"),
    body("contacts.email")
        .notEmpty()
        .withMessage("Email обязателен")
        .isEmail()
        .withMessage("Некорректный email")
        .normalizeEmail(),
    body("contacts.phone")
        .optional()
        .isMobilePhone("ru-RU")
        .withMessage("Некорректный номер телефона"),
    body("contacts.linkedin")
        .optional()
        .isURL()
        .withMessage("Некорректная ссылка LinkedIn"),
    body("contacts.github")
        .optional()
        .isURL()
        .withMessage("Некорректная ссылка GitHub"),
    body("workExperience")
        .optional()
        .isArray()
        .withMessage("Опыт работы должен быть массивом")
        .custom(workExperience => {
            if(!workExperience || workExperience.length === 0){
                return true;
            }

            workExperience.forEach(item => {
                if(!item.title) throw new Error("Должность обязательна");
                if(item.title.length > 100) throw new Error("Должность должна быть не длиннее 100 символов");
                if(!item.company) throw new Error("Компания обязательна");
                if(!item.period) throw new Error("Период работы обязателен");
            });

            return true;
        }),
    body("education")
        .optional()
        .isArray()
        .withMessage("Образование должно быть массивом")
        .custom(education => {
            if(!education || education.length === 0){
                return true;
            }

            education.forEach(item => {
                if(!item.degree) throw new Error("Степень обязательна");
                if(item.degree.length > 100) throw new Error("Степень должна быть не длиннее 100 символов");
                if(!item.field) throw new Error("Направление обучения обязательно");
                if(!item.institution) throw new Error("Учебное заведение обязательно");
                if(!item.year) throw new Error("Год окончания обязателен");
                if(typeof item.year !== "number") throw new Error("Год должен быть числом");
                if(item.year < 1900 || item.year > new Date().getFullYear() + 10) throw new Error("Некорректный год");
            });

            return true;
        }),
    body("skills")
        .isArray()
        .withMessage("Навыки должны быть массивом")
        .custom(skills => {
            if(!skills || skills.length === 0){
                throw new Error("Добавьте хотя бы один навык");
            }

            skills.forEach(item => {
                if(typeof item !== "string") throw new Error("Навык должен быть строкой");
            });
            
            return true;
        }),
    body("languages")
        .isArray()
        .withMessage("Языки должны быть массивом")
        .custom(languages => {
            if(!languages || languages.length === 0){
                throw new Error("Добавьте хотя бы один язык");
            }

            const validLevels = [ "Beginner", "Intermediate", "Advanced", "Native" ];
            languages.forEach(item => {
                if(!item.language) throw new Error("Название языка обязательно");
                if(!item.level) throw new Error("Уровень языка обязателен");
                if(!validLevels.includes(item.level)) throw new Error(`Некорректный уровень языка. Допустимые значения: ${validLevels.join(", ")}`);
            });

            return true;
        })
];

export const updateResumeValidation = [
    body("title")
        .optional()
        .notEmpty()
        .withMessage("Название не может быть пустым")
        .isLength({ max: 100 })
        .withMessage("Название должно быть не длиннее 100 символов"),
    body("description")
        .optional()
        .notEmpty()
        .withMessage("Описание не может быть пустым")
        .isLength({ max: 2000 })
        .withMessage("Описание должно быть не длиннее 2000 символов"),
    body("contacts.email")
        .optional()
        .notEmpty()
        .withMessage("Email не может быть пустым")
        .isEmail()
        .withMessage("Некорректный email")
        .normalizeEmail(),
    body("contacts.phone")
        .optional()
        .isMobilePhone("ru-RU")
        .withMessage("Некорректный номер телефона"),
    body("contacts.linkedin")
        .optional()
        .isURL()
        .withMessage("Некорректная ссылка LinkedIn"),
    body("contacts.github")
        .optional()
        .isURL()
        .withMessage("Некорректная ссылка GitHub"),
    body("workExperience")
        .optional()
        .isArray()
        .withMessage("Опыт работы должен быть массивом")
        .custom(workExperience => {
            if(!workExperience || workExperience.length === 0){
                return true;
            }

            workExperience.forEach(item => {
                if(!item.title) throw new Error("Должность обязательна");
                if(item.title.length > 100) throw new Error("Должность должна быть не длиннее 100 символов");
                if(!item.company) throw new Error("Компания обязательна");
                if(!item.period) throw new Error("Период работы обязателен");
            });

            return true;
        }),
    body("education")
        .optional()
        .isArray()
        .withMessage("Образование должно быть массивом")
        .custom(education => {
            if(!education || education.length === 0){
                return true;
            }

            education.forEach(item => {
                if(!item.degree) throw new Error("Степень обязательна");
                if(item.degree.length > 100) throw new Error("Степень должна быть не длиннее 100 символов");
                if(!item.field) throw new Error("Направление обучения обязательно");
                if(!item.institution) throw new Error("Учебное заведение обязательно");
                if(!item.year) throw new Error("Год окончания обязателен");
                if(typeof item.year !== "number") throw new Error("Год должен быть числом");
                if(item.year < 1900 || item.year > new Date().getFullYear() + 10) throw new Error("Некорректный год");
            });

            return true;
        }),
    body("skills")
        .optional()
        .isArray()
        .withMessage("Навыки должны быть массивом")
        .custom(skills => {
            if(!skills || skills.length === 0){
                throw new Error("Добавьте хотя бы один навык");
            }

            skills.forEach(item => {
                if(typeof item !== "string") throw new Error("Навык должен быть строкой");
            });
            
            return true;
        }),
    body("languages")
        .optional()
        .isArray()
        .withMessage("Языки должны быть массивом")
        .custom(languages => {
            if(!languages || languages.length === 0){
                throw new Error("Добавьте хотя бы один язык");
            }

            const validLevels = [ "Beginner", "Intermediate", "Advanced", "Native" ];
            languages.forEach(item => {
                if(!item.language) throw new Error("Название языка обязательно");
                if(!item.level) throw new Error("Уровень языка обязателен");
                if(!validLevels.includes(item.level)) throw new Error(`Некорректный уровень языка. Допустимые значения: ${validLevels.join(", ")}`);
            });

            return true;
        })
];