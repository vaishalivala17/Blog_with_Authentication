# Blog App 📰

A full-stack Node.js blog platform with authentication, image uploads, and admin dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-blue)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)](https://mongoosejs.com)

## ✨ Features
- User authentication (register/login/profile)
- Blog CRUD with image upload (JPEG/PNG)
- Admin dashboard & user management
- Search, categories, dashboard
- Role-based access (admin/user)

## 🛠 Tech Stack
| Frontend | Backend | Database | Other |
|----------|---------|----------|--------|
| EJS | Express | MongoDB (Mongoose) | Multer, bcrypt, sessions |

## 📋 Prerequisites
- Node.js 18+
- MongoDB (local)

## 🚀 Quick Start
1. Clone: `git clone <repo> && cd Blog_App`
2. Install: `npm install`
3. Create `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/Blog_With_Auth
   SESSION_SECRET=your_secret_key
   ```
4. Run: `npm run dev`
5. Open: http://localhost:3001

## 📁 Structure
```
Blog_App/
├── controllers/     # Auth & blog logic
├── models/          # User & Blog schemas
├── routes/          # Routes
├── views/           # EJS pages
├── public/uploads/  # Images
├── index.js         # Server
└── package.json
```

## 🤝 Contributing
Fork, PR welcome!
