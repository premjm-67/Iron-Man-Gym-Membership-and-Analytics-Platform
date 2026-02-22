# Iron Man Fitness Studio - Gym Management & Analytics Platform

A full-stack gym management system with member registration, subscription handling, attendance tracking with LeetCode-style heatmaps, and owner dashboard analytics.

## 🎯 Project Overview

This platform enables gym owners to manage members, subscriptions, track attendance, and view detailed analytics. Members can register, purchase subscriptions, mark attendance, and visualize their fitness journey through interactive heatmaps.

## ✨ Key Features

### Member Features
- 📝 User Registration & Authentication (JWT-based)
- 💳 Subscription Management (Monthly/Quarterly/Annual)
- 📊 Attendance Tracking with LeetCode-style Heatmap (24px squares)
- 🔥 Streak Counter (Current & Max)
- 📈 Monthly Attendance Analytics
- 👤 Profile Management
- 🔐 Role-based Access Control

### Owner Features
- 👥 Member Management Dashboard
- 💰 Payment & Subscription Monitoring
- 🚨 Subscription Expiry Management
- 📋 Member Reports


## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 18, React Router, CSS3, LocalStorage |
| **Backend** | Node.js, Express.js, JWT, bcryptjs |
| **Database** | JSON Files (Node.js fs module) |
| **Authentication** | JWT Tokens |
| **Styling** | Custom CSS, Gradients, Animations |
| **State Management** | React Context API |

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Git

### Backend Setup
```bash
cd "gym management system/backend"
npm install
node server.js
# Server runs on http://localhost:5000
