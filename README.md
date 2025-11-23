# 🚗 DLMS - Driving License Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.0%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0%2B-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-orange)](https://www.mongodb.com/)

## 🌟 Live Demo

**https://get-dlms.onrender.com/**

Experience the future of driving license management with our comprehensive, interactive, and responsive platform. 🚀

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🏠 **Modern Homepage**
- Interactive hero section with live statistics
- Animated feature cards with hover effects
- Responsive design for all devices
- Dark/Light mode toggle

### 👤 **User Management**
- User registration and authentication
- Email verification system
- OTP verification
- Profile management with photo upload
- Multi-language support

### 📋 **License Management**
- License application process
- Multiple license categories (Motorcycle, Automobile, Public Transport, Trucks, etc.)
- License renewal system
- Digital license generation with QR codes
- License verification system

### 📚 **Exam Management**
- Theory exam system
- Practical exam scheduling
- Exam result management
- Trial exam functionality
- Online practice tests

### 💳 **Payment Integration**
- Secure payment processing
- Multiple payment methods
- Payment tracking and history
- Receipt generation

### 🔔 **Notification System**
- Real-time notifications
- Email notifications
- In-app notification center
- Activity logging

### 🛠️ **Admin Dashboard**
- User management
- Application review system
- Exam management
- Payment management
- News and announcements
- Report generation
- Violation tracking

### 👨‍🏫 **Examiner Portal**
- Exam conduct system
- Result entry
- Schedule management
- Performance tracking

### 🚨 **Traffic Police Dashboard**
- License verification
- Violation reporting
- Case management
- Real-time data access

### 📰 **News & Updates**
- News management system
- Featured articles
- Category-based news
- Responsive news display

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Material-UI (MUI)** - Comprehensive component library
- **React Router** - Declarative routing solution
- **Framer Motion** - Production-ready animation library
- **Axios** - Promise-based HTTP client
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Atlas cloud hosting
- **Mongoose** - MongoDB object modeling
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload handling

### Tools & Libraries
- **Vite** - Next-generation frontend tooling
- **ESLint** - JavaScript linter
- **Prettier** - Code formatter
- **Render** - Cloud hosting platform

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local instance or Atlas account)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/DLMS--Driving-license-management-system.git
cd DLMS--Driving-license-management-system
```

2. **Navigate to backend directory**
```bash
cd backend
```

3. **Install backend dependencies**
```bash
npm install
```

4. **Create environment file**
```bash
cp .env.example .env
```

5. **Configure environment variables** (see [Environment Variables](#-environment-variables))

6. **Start the backend server**
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Start the development server**
```bash
npm run dev
```

## 📖 Usage

### Development Mode
- Backend runs on `http://localhost:5004`
- Frontend runs on `http://localhost:5173`
- API endpoints are prefixed with `/api`

### Production Mode
- Build frontend: `npm run build` in frontend directory
- Start backend: `npm start` in backend directory
- Access the application at the configured domain

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/admin/login` - Admin login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-profile` - Upload profile picture

### Licenses
- `POST /api/license/apply` - Apply for license
- `GET /api/license/:licenseNumber` - Get license details
- `PUT /api/license/renew` - Renew license
- `GET /api/license/verify/:licenseNumber` - Verify license

### Exams
- `GET /api/exams/schedule` - Get exam schedule
- `POST /api/exams/apply` - Apply for exam
- `GET /api/exams/results` - Get exam results

### Payments
- `POST /api/payments/create` - Create payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/verify` - Verify payment

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/applications` - Get license applications
- `GET /api/admin/reports` - Generate reports

## 📁 Project Structure

```
DLMS--Driving-license-management-system/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Custom middleware
│   ├── models/               # Database models
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   ├── uploads/              # File uploads directory
│   ├── .env                  # Environment variables
│   ├── server.js             # Main server file
│   └── package.json
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── router/           # Routing configuration
│   │   ├── services/         # API services
│   │   ├── styles/           # CSS/SCSS files
│   │   ├── theme/            # MUI theme configuration
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Application entry point
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── vite.config.mjs       # Vite configuration
├── .gitignore
├── README.md
└── LICENSE
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Server
PORT=5004
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
# API URL
VITE_API_URL=http://localhost:5004/api
```

## 🤝 Contributing

We welcome contributions to the DLMS project! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Guidelines
- Follow the existing code style
- Write clear commit messages
- Add tests if applicable
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**DLMS Team**

## 📞 Support

For support, please contact:
- Email: dlms.sys.2025@gmail.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/DLMS--Driving-license-management-system/issues)

## 🔄 Changelog

### v1.0.0
- ✅ Initial release
- ✅ User authentication system
- ✅ License application process
- ✅ Exam management system
- ✅ Payment integration
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Multi-language support
- ✅ Dark/Light mode

---

## 🌟 Acknowledgments

- Special thanks to the open-source community
- Inspired by modern driving license systems worldwide
- Built with ❤️ for better user experience

---

<div align="center">

**⭐ Star this repo if you found it helpful! ⭐**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-brightgreen?style=for-the-badge)](https://get-dlms.onrender.com/)

</div>