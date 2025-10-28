## Backend (Frontend-Hub) — документация проекта

Этот репозиторий — простой backend-сервис на Express + MongoDB с регистрацией пользователей, загрузкой аватаров, выдачей JWT токена и выборками пользователей по ролям. Ниже описаны архитектура, установка, переменные окружения, эндпоинты, структура данных и детали по работе middleware загрузки файлов (Multer) и JWT.

### Технологии
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **БД**: MongoDB (Mongoose)
- **Аутентификация**: JWT (jsonwebtoken)
- **Хеширование паролей**: bcrypt
- **Загрузка файлов**: multer (хранение на диске)
- **E-mail**: nodemailer (Gmail)
- **CORS**: открытый origin `*` (ВРЕМЕННО)

### Структура проекта
```
config/
  mailer.js         // конфигурация Nodemailer (Gmail)
  multer.js         // конфигурация Multer (диск, /uploads/avatars)
controllers/
  auth.controller.js// регистрация, выдача JWT, выборка по ролям
models/
  User.model.js     // схема пользователя
routes/
  auth.route.js     // маршруты /auth
index.js            // точка входа, подключение БД, базовые мидлвары
```

### Установка и запуск
1) Установите зависимости:
```bash
npm install
```

2) Создайте файл `.env` в корне и укажите переменные окружения (см. следующий раздел).

3) Запуск в разработке:
```bash
npm run dev
```

4) Продакшн-запуск:
```bash
npm start
```

Сервер по умолчанию стартует на `PORT` из `.env` или `5000`. Папка `uploads/` отдается статически по пути `/uploads`.

### Переменные окружения (.env)
- `PORT` — порт HTTP-сервера (необязательно, по умолчанию 5000)
- `MONGODB_CONNECT` — строка подключения к MongoDB (например, `mongodb://localhost:27017/your-db`)
- `JWT_SECRET` — секрет для подписи JWT
- `JWT_EXPIRES_IN` — время жизни токена (например, `1d`, `12h`, `3600s`)
- `GMAIL_USER_TEST` — Gmail-аккаунт для отправки писем
- `GMAIL_PASS_TEST` — пароль приложения Gmail (App Password)

### Архитектура и ключевые мидлвары

- `express.json()` — парсинг JSON тела запроса
- `cors({ origin: "*" })` — разрешает запросы с любых доменов
- `express.static('uploads')` — раздача статических файлов (аватаров) по `/uploads`
- `multer` (из `config/multer.js`) — обработка загрузки аватаров в `uploads/avatars/` c фильтром по `image/*` и лимитом 5 МБ
- JWT формируется в `auth.controller.js` при регистрации

### Модель данных пользователя
```json
{
  "firstName": "string",         // required
  "lastName": "string",          // required
  "patronymic": "string",        // required
  "email": "string",             // required, unique
  "password": "string",          // required, хранится в БД как bcrypt-хеш
  "phoneNumber": 79990001122,     // number, unique
  "avatar": "string | null",     // имя файла, если загружен
  "roles": ["student"|"user"|"admin"], // массив ролей, по умолчанию ["student"]
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### Эндпоинты

Все пути ниже относительно базового префикса `/auth`.

- Регистрация пользователя
  - `POST /auth/registration`
  - Тип контента: `multipart/form-data`
  - Поля тела:
    - `firstName` (string, required)
    - `lastName` (string, required)
    - `patronymic` (string, required)
    - `email` (string, required, unique)
    - `password` (string, required)
    - `phoneNumber` (number, optional/unique)
    - `avatar` (file, optional, image/*, ≤ 5 МБ)
  - Успешный ответ: `201 Created`
    ```json
    {
      "message": {
        "_id": "...",
        "firstName": "...",
        "lastName": "...",
        "patronymic": "...",
        "email": "...",
        "phoneNumber": 79990001122,
        "avatar": "<filename or undefined>",
        "roles": ["student"],
        "createdAt": "...",
        "updatedAt": "...",
        "__v": 0
      },
      "token": "<JWT>"
    }
    ```
  - Ошибки:
    - `400` — пользователь с таким email уже существует (файл аватара будет удален)
    - `500` — внутренняя ошибка сервера

- Получить пользователей по роли
  - `GET /auth/role/admin`
  - `GET /auth/role/user`
  - `GET /auth/role/student`
  - Ответ `200 OK`:
    ```json
    {
      "list": 2,
      "admins"|"users"|"students": [ { "_id": "...", "email": "...", ... } ]
    }
    ```
  - Ошибки: `500` — ошибка получения пользователей

### JWT: генерация, контракт и рекомендуемый middleware

В текущей реализации JWT выдаётся при регистрации. Токен создаётся из payload:
```json
{
  "userId": "<MongoId>",
  "email": "user@example.com"
}
```
Секрет: `JWT_SECRET`, срок жизни: `JWT_EXPIRES_IN`.

Контракт входных/выходных данных JWT:
- **Вход (sign)**: объект пользователя (минимум `_id`, `email`)
- **Выход (sign)**: строка токена JWT
- **Вход (verify)**: заголовок `Authorization: Bearer <token>`
- **Выход (verify)**: объект-пейлоад `{ userId, email, iat, exp }` или ошибка 401/403

Рекомендуемый middleware для защиты маршрутов (пример):
```js
// Пример: auth.middleware.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, email: payload.email };
    return next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
```

Использование в маршруте:
```js
import { Router } from 'express';
import { requireAuth } from './auth.middleware.js';

const router = Router();
router.get('/profile', requireAuth, (req, res) => {
  res.json({ userId: req.user.userId, email: req.user.email });
});
```

Примечание: в репозитории сейчас нет защищённых эндпоинтов — добавьте middleware на нужные маршруты при необходимости.

### Загрузка файлов (Multer)
- Папка: `uploads/avatars/` (создаётся автоматически)
- Имя файла: UUID + оригинальное расширение (например, `6f2a...-a1.png`)
- Фильтр: только `image/*`, иначе ошибка `Можно загружать только изображения!`
- Лимит размера: 5 МБ
- Доступ по URL: `GET /uploads/avatars/<filename>`

### Почта (Nodemailer)
- Используется сервис Gmail через `nodemailer.createTransport`
- Для отправки приветственного письма при регистрации берутся:
  - `GMAIL_USER_TEST` и `GMAIL_PASS_TEST`
- Тема и контент письма заданы статически в контроллере и могут быть изменены под ваши нужды

### Точка входа и здоровье сервиса
- `GET /` → `200 { "message": "worked" }`
- Подключение к БД происходит при старте сервера; при успехе — `DB connected`

### Примеры запросов

Регистрация (cURL):
```bash
curl -X POST http://localhost:5000/auth/registration \
  -H "Content-Type: multipart/form-data" \
  -F firstName=Ivan \
  -F lastName=Ivanov \
  -F patronymic=Ivanovich \
  -F email=ivan@example.com \
  -F password=secret123 \
  -F phoneNumber=79990001122 \
  -F avatar=@./avatar.png
```

Список админов:
```bash
curl http://localhost:5000/auth/role/admin
```

### Частые ошибки и их причины
- `400 This user already exists!` — email уже зарегистрирован; загруженный файл будет удалён
- `403 Invalid or expired token` — неверный/просроченный JWT (в примере middleware)
- `413 Payload Too Large` — файл больше 5 МБ
- `Unsupported image type` — MIME не начинается с `image/`

### Лицензия
ISC

