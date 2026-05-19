# Shasak Tournament - Free Fire Competition Platform

A modern and professional Free Fire tournament application built with React, Tailwind CSS, and Firebase.

## 🚀 Features

- **Upcoming Tournaments**: List of scheduled matches with countdowns and slot tracking.
- **Real-time Registration**: Secure registration form for players (Solo/Duo/Squad).
- **Payment Verification**: Built-in screenshot and Transaction ID upload for manual admin approval.
- **Admin Dashboard**: Create tournaments, manage registrations, release Room IDs, and push announcements.
- **User Profiles**: Manage in-game details (IGN, UID) and track match participation.
- **Premium UI**: Dark-themed gaming interface with smooth animations and responsive mobile design.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion.
- **Backend / Database**: Firebase (Auth & Firestore).
- **Icons**: Lucide React.
- **Deployment**: Ready for Vercel, Netlify, or GitHub Pages.

## ⚙️ Setup & Installation

### 1. Prerequisities
- Node.js (v18 or higher)
- A Firebase Project (Google Cloud console)

### 2. Get the Source
```bash
git clone <your-repo-link>
cd shasak-tournament
npm install
```

### 3. Environment Configuration
Copy the `.env.example` to a new file named `.env`:
```bash
cp .env.example .env
```

Fill in your Firebase credentials from your Firebase Console (Project Settings -> General -> Your Apps).

### 4. Development
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```
Static files will be generated in the `dist/` directory.

## 🔒 Security Rules
The project includes a `firestore.rules` file. Make sure to deploy these to your Firebase project to secure your data. Only admins (configurable in the database) can create tournaments or approve payments.

## 📱 Screenshots
*(Add your screenshots here)*

## ⚖️ License
This project is licensed under the Apache-2.0 License.
