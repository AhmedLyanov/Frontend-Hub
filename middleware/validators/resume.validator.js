import { body } from "express-validator";

export const createResumaValidation = [
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
        .custom((workExperience, { req }) => {
            if(!workExperience || workExperience.length === 0){
               return true;
            }

            workExperience.forEach(item => {
                if(!item.title) throw new Error("Должность обязательна");
                if(item.title.length > 100) throw new Error("Должность должна не длиннее 100 символов");
                if(!item.company)throw new Error("Компания обязательна");
                if(!item.period) throw new Error("Период работы обязателен");
                return true;
            });
        }),
    body("education")
        .isArray()
        .withMessage("Опыт работы должен быть массивом")
        .custom((education, { req }) => {
            education.forEach(item => {

            });
        })
];