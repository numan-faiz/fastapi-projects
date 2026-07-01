# Akhuwat FIRST LMS - Frontend

A professional Learning Management System built with React 18 and FastAPI backend.

## 🚀 Tech Stack

- **Frontend Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.0
- **Notifications**: React Toastify 9.1.3
- **Forms**: React Hook Form 7.47.0
- **Charts**: Chart.js 4.4.0 + React Chart.js 2 5.2.0
- **Animations**: Framer Motion 10.16.0
- **Icons**: React Icons 4.11.0
- **Styling**: TailwindCSS 3.3.5
- **Build Tool**: Vite 5.0.0

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Teachers.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Subjects.jsx
│   │   │   └── AttendanceReport.jsx
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Card.jsx
│   │   ├── teacher/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MarkAttendance.jsx
│   │   │   └── AttendanceHistory.jsx
│   │   └── student/
│   │       ├── Dashboard.jsx
│   │       ├── MyAttendance.jsx
│   │       └── Profile.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── subjectService.js
│   │   └── attendanceService.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎨 Design Features

- **Professional Color Scheme**: Navy blue (#1A3C5E), Professional blue (#2A6F97), Light blue (#4A9BC7)
- **Glassmorphism Effects**: Modern card designs with backdrop blur
- **Smooth Animations**: Hover effects and transitions using Framer Motion
- **Responsive Design**: Mobile, tablet, and desktop layouts
- **Typography**: Inter font family for clean, professional look

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Backend API running on http://localhost:8000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🔐 Authentication

The application uses JWT token-based authentication with the following flow:

1. User logs in via `/login` page
2. Token is stored in localStorage
3. Token is included in all API requests via Axios interceptors
4. Protected routes check for valid token and user role
5. Auto-logout on token expiry (401 responses)

## 👥 User Roles & Access

### Admin
- Full access to all features
- Can manage teachers, students, and subjects
- Can view all attendance reports
- Can assign teachers to subjects
- Can enroll students in subjects

### Teacher
- Can view assigned subjects
- Can mark attendance for students
- Can view attendance history
- Cannot access admin features

### Student
- Can view enrolled subjects
- Can view personal attendance history
- Can update profile
- Cannot access admin or teacher features

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user profile

### Teachers (Admin only)
- `GET /teacher/` - List all teachers
- `POST /teacher/` - Create teacher
- `PUT /teacher/{id}` - Update teacher
- `DELETE /teacher/{id}` - Delete teacher

### Students (Admin only)
- `GET /student/` - List all students
- `POST /student/` - Create student
- `PUT /student/{id}` - Update student
- `DELETE /student/{id}` - Delete student

### Subjects (Admin only)
- `GET /subject/` - List all subjects
- `POST /subject/` - Create subject
- `PUT /subject/{id}` - Update subject
- `DELETE /subject/{id}` - Delete subject
- `POST /subject/{id}/teacher/{teacher_id}` - Assign teacher
- `POST /subject/{id}/student/{student_id}` - Enroll student
- `DELETE /subject/{id}/teacher/{teacher_id}` - Remove teacher
- `DELETE /subject/{id}/student/{student_id}` - Remove student
- `GET /subject/my-subjects` - Get teacher's assigned subjects

### Attendance
- `POST /attendance/` - Mark attendance (Teacher/Admin)
- `GET /attendance/report` - Get attendance report with filters
- `GET /attendance/my` - Get student's own attendance

## 🎯 Key Features

### Login Page
- Professional gradient background
- Glassmorphism card design
- Show/hide password toggle
- Form validation
- Role-based redirect after login

### Admin Dashboard
- Statistics cards (teachers, students, subjects, attendance rate)
- Quick action buttons
- Recent activity feed
- Sidebar navigation

### Teacher Dashboard
- View assigned subjects
- Mark attendance with present/absent/leave options
- View attendance history
- Date-based filtering

### Student Dashboard
- View enrolled subjects
- Attendance statistics
- Personal attendance history
- Profile management

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Logout clears token and redirects

#### Admin Features
- [ ] Dashboard displays correct stats
- [ ] Can create, edit, delete teachers
- [ ] Can create, edit, delete students
- [ ] Can create, edit, delete subjects
- [ ] Can assign teachers to subjects
- [ ] Can enroll students in subjects
- [ ] Can view attendance reports with filters

#### Teacher Features
- [ ] Dashboard shows assigned subjects
- [ ] Can mark attendance for students
- [ ] Can view attendance history
- [ ] Cannot access admin routes

#### Student Features
- [ ] Dashboard shows enrolled subjects
- [ ] Can view attendance history
- [ ] Can update profile
- [ ] Cannot access admin or teacher routes

## 🐛 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend allows requests from http://localhost:3000

### Token Expiry
Tokens expire after 30 minutes (configurable via backend). Users will be automatically logged out.

### API Connection
Ensure the backend is running on http://localhost:8000 before starting the frontend.

## 📝 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Build the project
2. Deploy the `dist` folder
3. Set environment variables in the hosting platform
4. Update the API URL to the production backend URL

## 📄 License

© 2026 Akhuwat FIRST. All rights reserved.
