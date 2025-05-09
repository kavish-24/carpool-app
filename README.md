# 🚗 Carpooling App

## Introduction

Hi! I’m **Kavish**, a passionate full-stack developer. This is my **Carpooling App**—a complete web application designed to help people share rides, save costs, and reduce traffic. This project demonstrates my skills in frontend and backend development, real-time communication, database management, and cloud deployment. I'm sharing it as part of my portfolio for hiring opportunities.

### 🔗 Live Demo[
(https://carpool-app-2.onrender.com/)


---

## 📋 Project Overview

The Carpooling App allows users to:
- Register and log in securely.
- Create rides as drivers.
- Search and book rides as passengers.
- Receive real-time notifications when rides are booked.
- Manage sessions and ride data efficiently.

---

## ✨ Key Features

- 🔐 **User Authentication**: Secure login with email and password.
- 🛣️ **Create Rides**: Drivers can add start/destination, capacity, fare, etc.
- 🔍 **Search & Book Rides**: Passengers can view and book available rides.
- ⚡ **Real-Time Notifications**: WebSocket alerts users of new bookings.
- 🧾 **Session Management**: Sessions expire after 1 hour for security.
- ✏️ **Ride Management**: Edit or delete rides if you're the creator.

---

## 🛠 Tech Stack

### Frontend
- **React**, **Vite**, **Axios**
- Responsive UI and fast builds via Vite

### Backend
- **Node.js**, **Express**, **MongoDB**, **WebSocket (ws)**
- RESTful APIs and real-time communication

### Security
- **bcrypt** for password hashing
- **CORS** for secure cross-origin requests

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## 🚀 How to Explore

1. **Visit the App**  
   [Frontend on Vercel](https://carpool-app-frontend.vercel.app)

2. **Login / Register**
   - Use a test account:  
     `Email:` testuser@example.com  
     `Password:` test123  
   - Or sign up for a new account.

3. **Try It Out**
   - Create a ride from “Downtown” to “Airport”
   - Book a ride and see the real-time notification update

4. **API Testing**
   Use Postman to test endpoints:  
   Example:  
   `POST /api/login` → `{ "email": "testuser@example.com", "password": "test123" }`

---

## 🧠 Code Highlights

- **Authentication**: bcrypt + session-based login
- **Real-Time Updates**: WebSocket notifies clients instantly
- **CORS Setup**: Handles both local and production environments
- **Robust Error Handling**: Clean, user-friendly API responses

---

## 🌐 Deployment Details

- **Frontend on Vercel**
  - Fast load times and CI/CD support
  - `VITE_API_URL` for backend connectivity

- **Backend on Render**
  - Manages sessions, APIs, and WebSocket on a single port
  - `MONGODB_URI` securely stored in environment variables

---

## 🧩 Challenges & Solutions

- **CORS Errors**  
  Fixed by specifying `allowedOrigins` for local and deployed environments.

- **MongoDB Deprecation Warnings**  
  Updated connection logic to remove deprecated options.

- **WebSocket Connection Timeouts**  
  Implemented periodic pings every 30 seconds to maintain connections.

---

## 📁 GitHub Repository

Source Code: [GitHub – kavish-24/carpool-app](https://github.com/kavish-24/carpool-app)  
Includes both frontend and backend directories with setup instructions.

---

## 🎯 Why This Project Matters

This app showcases my ability to:
- Build and deploy full-stack apps from scratch
- Handle real-time communication and authentication
- Resolve production-level issues like CORS and deprecations
- Write clean, scalable, maintainable code

---

## 🚧 Future Improvements

- Validate ride times (only allow future rides)
- Add ride ratings and in-app chat
- IP whitelisting for MongoDB Atlas for added security

---

## 📬 Contact Me

I'd love to connect or discuss opportunities!

- **Email:** kavishtoraskar24@gmail.com  
- **GitHub:** [kavish-24](https://github.com/kavish-24)  


---

Thanks for checking out my Carpooling App! 🙌
