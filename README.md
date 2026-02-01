# QuickChat – Real-Time Chat Application 🚀

QuickChat is a full-stack real-time chat application built using the MERN stack.  
It supports secure authentication, real-time messaging, image uploads, and online user tracking with a production-ready architecture.

This project was developed, debugged, and deployed independently, with inspiration from open-source references.

### 🔗 Live Demo
Frontend: https://quickchat-sable.vercel.app
Backend: https://quickchat-ychg.onrender.com
---

## ✨ Features

- 🔐 User Authentication (Signup / Login / Logout)
- 🛡 JWT-based authentication using **HTTP-only cookies**
- 💬 Real-time messaging with **Socket.io**
- 🟢 Online / Offline user status
- 🖼 Profile image upload using **Cloudinary**
- 🔄 Persistent login on page refresh
- 🌐 Secure CORS & preflight handling
- 📱 Responsive UI with Tailwind CSS & DaisyUI

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Zustand (state management)
- Tailwind CSS + DaisyUI
- Axios
- Socket.io-client

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.io
- JWT (Authentication)
- bcrypt (Password hashing)
- Cloudinary (Image uploads)

---

## 🧩 Architecture Overview

Frontend (Vercel / Localhost)
↓
Backend API & Socket Server (Render / Localhost)
↓
MongoDB Atlas
↓
Cloudinary (Image Storage)

---

## 🔐 Authentication & Security

- Passwords are hashed using **bcrypt**
- JWT tokens are stored in **HTTP-only cookies**
- CORS configured for secure cross-origin requests
- Preflight (OPTIONS) requests handled properly
- Secrets managed via environment variables

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=8000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

