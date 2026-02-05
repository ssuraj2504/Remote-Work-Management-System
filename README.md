# Remote Work Management System

A full-stack enterprise-level application designed for distributed teams working in US night shifts. Built with React (frontend), Node.js/Express (backend), and PostgreSQL (database) with JWT-based authentication.

## 🚀 Features

### Authentication & Authorization
- **Secure JWT-based authentication** with bcrypt password hashing
- **Role-based access control (RBAC)** with Admin and Employee roles
- Session management with token expiration
- Protected routes on frontend

### Admin Dashboard
- View all employees with task statistics
- Create and assign tasks to employees
- Set task priority (Low/Medium/High) and deadlines
- Assign US shift timings with timezone support
- Track task progress in real-time
- View daily reports submitted by employees
- Filter reports by employee and date

### Employee Dashboard
- View assigned tasks with priority and status
- Update task status (Pending → In Progress → Completed)
- View assigned US shift timing with timezone
- Submit daily work reports
- View past submitted reports
- Task completion tracking

### Task Management
- Full CRUD operations on tasks
- Task assignment to employees
- Priority levels and due dates
- Real-time status tracking
- Task filtering and search

### Shift Management
- US timezone support (EST, CST, MST, PST)
- Shift assignment per employee
- Start and end time configuration
- Active/inactive shift status

### Daily Reporting
- Employees submit daily work reports
- Track time spent on tasks
- Report history and filtering
- Admin analytics on reports

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Remote-Work-Management-System
```

### 2. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE remote_work_db;

# Exit psql
\q

# Run schema
psql -U postgres -d remote_work_db -f database/schema.sql

# Run seed data (optional - creates sample data)
psql -U postgres -d remote_work_db -f database/seed.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# Required variables:
# - DB_HOST=localhost
# - DB_PORT=5432
# - DB_USER=postgres
# - DB_PASSWORD=your_password
# - DB_NAME=remote_work_db
# - JWT_SECRET=your_secret_key
# - PORT=5000
# - FRONTEND_URL=http://localhost:3000

# Start the backend server
npm start

# Or use nodemon for development
npm run dev
```

Backend will run on **http://localhost:5000**

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

Frontend will run on **http://localhost:3000**

## 🔑 Default Login Credentials (from seed data)

**Admin Account:**
- Email: admin@company.com
- Password: password123

**Employee Accounts:**
- john.doe@company.com / password123
- jane.smith@company.com / password123
- mike.wilson@company.com / password123

> **Note:** These credentials only work if you ran the seed.sql file. The passwords in seed.sql are placeholders - you'll need to update them with actual bcrypt hashes or create new users via the registration page.

## 📁 Project Structure

```
Remote-Work-Management-System/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── taskController.js    # Task operations
│   │   ├── shiftController.js   # Shift management
│   │   └── reportController.js  # Daily reports
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── roleMiddleware.js    # RBAC enforcement
│   ├── routes/
│   │   ├── auth.js             # Auth endpoints
│   │   ├── users.js            # User endpoints
│   │   ├── tasks.js            # Task endpoints
│   │   ├── shifts.js           # Shift endpoints
│   │   └── reports.js          # Report endpoints
│   ├── utils/
│   │   └── validation.js       # Input validation
│   ├── server.js               # Express app
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # Login, Register
│   │   │   ├── Admin/          # Admin components
│   │   │   ├── Employee/       # Employee components
│   │   │   └── Layout/         # Navbar, Sidebar
│   │   ├── context/
│   │   │   └── AuthContext.js  # Auth state management
│   │   ├── services/
│   │   │   └── api.js          # API service
│   │   ├── App.js              # Main app with routing
│   │   ├── App.css             # Styles
│   │   └── index.js
│   └── package.json
├── database/
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Sample data
└── README.md
```

## 🌐 API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference

**Authentication:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

**Users:**
- GET `/api/users` - Get all users (Admin)
- GET `/api/users/employees` - Get all employees (Admin)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user (Admin)

**Tasks:**
- GET `/api/tasks` - Get tasks
- POST `/api/tasks` - Create task (Admin)
- PUT `/api/tasks/:id` - Update task
- PATCH `/api/tasks/:id/status` - Update status
- DELETE `/api/tasks/:id` - Delete task (Admin)

**Shifts:**
- GET `/api/shifts` - Get shifts
- POST `/api/shifts` - Create shift (Admin)
- PUT `/api/shifts/:id` - Update shift (Admin)
- DELETE `/api/shifts/:id` - Delete shift (Admin)

**Reports:**
- GET `/api/reports` - Get reports
- POST `/api/reports` - Submit report
- GET `/api/reports/employee/:id` - Get by employee (Admin)
- GET `/api/reports/date/:date` - Get by date (Admin)

## 🎨 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management

### Database
- **PostgreSQL** with:
  - Relational schema
  - Foreign keys & constraints
  - Indexes for performance
  - Views for analytics

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Protected API routes with middleware
- Role-based access control
- SQL injection prevention (parameterized queries)
- CORS configuration
- Input validation and sanitization

## 📱 Responsive Design

- Mobile-friendly UI
- Responsive grid layouts
- Adaptive navigation
- Touch-friendly controls

## 🧪 Testing

To test the application:

1. **Register** a new admin and employee account
2. **Login** as admin
3. **Create shifts** for employees
4. **Create and assign tasks** to employees
5. **Logout** and login as employee
6. **Update task status**
7. **Submit daily reports**
8. **Login** as admin to view reports

## 🚀 Deployment

### Backend Deployment
1. Set environment variables in production
2. Use production database credentials
3. Set `NODE_ENV=production`
4. Use process managers like PM2

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to hosting service (Vercel, Netlify, etc.)
3. Update `REACT_APP_API_URL` to production backend URL

### Database
1. Use managed PostgreSQL service
2. Enable SSL connections
3. Regular backups
4. Connection pooling

## 📊 Database Schema

### Tables
- **users** - User accounts (admin, employee)
- **tasks** - Task assignments
- **shifts** - Employee shift schedules
- **daily_reports** - Work reports

See `database/schema.sql` for complete schema definition.

## 🤝 Contributing

This is a demonstration project. For production use, consider:

- Adding unit and integration tests
- Implementing email notifications
- Adding file upload for reports
- Advanced analytics dashboard
- Export functionality (CSV, PDF)
- Real-time updates with WebSockets
- Audit logging

## 📄 License

ISC License

## 👨‍💻 Author

Built as an enterprise-level demonstration project for Remote Work Management.

## 🆘 Support

For issues or questions:
1. Check the API documentation
2. Review database schema
3. Check browser console for frontend errors
4. Check backend logs for API errors

## 🎯 Future Enhancements

- Email/SMS notifications
- Calendar integration
- File attachments
- Advanced search and filters
- Performance analytics
- Multi-language support
- Dark mode
- Mobile app (React Native)
