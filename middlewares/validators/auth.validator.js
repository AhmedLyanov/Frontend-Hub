import { body, param } from 'express-validator';
import { handleValidationErrors } from '../error.validator.js';
import User from '../../models/User.model.js'

const checkEmailUnique = async (email) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email уже используется');
  }
  return true;
};

const checkPhoneUnique = async (phoneNumber) => {
  if (!phoneNumber) return true;
  
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new Error('Номер телефона уже используется');
  }
  return true;
};

export const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Имя обязательно')
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно быть от 2 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/)
    .withMessage('Имя может содержать только буквы, пробелы и дефисы'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Фамилия обязательна')
    .isLength({ min: 2, max: 50 })
    .withMessage('Фамилия должна быть от 2 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/)
    .withMessage('Фамилия может содержать только буквы, пробелы и дефисы'),

  body('patronymic')
    .trim()
    .notEmpty()
    .withMessage('Отчество обязательно')
    .isLength({ min: 2, max: 50 })
    .withMessage('Отчество должно быть от 2 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/)
    .withMessage('Отчество может содержать только буквы, пробелы и дефисы'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес')
    .custom(checkEmailUnique),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Пароль должен содержать хотя бы одну заглавную букву, одну строчную и одну цифру'),

  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Введите корректный номер телефона')
    .custom(checkPhoneUnique),

  handleValidationErrors
];


export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Почта обязательна')
    .isLength({ min: 6, max: 100 })
    .withMessage('В почте должно быть от 6 до 100 символов')
    .isEmail()
    .withMessage('Введите корректный email адрес')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),

  handleValidationErrors
]











