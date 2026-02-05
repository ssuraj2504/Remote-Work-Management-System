# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the header:
```
Authorization: Bearer <token>
```

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "employee"  // or "admin"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "employee"
  }
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "employee"
  }
}
```

---

## Users

### Get All Users (Admin Only)

```http
GET /users
```

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@company.com",
      "full_name": "Administrator",
      "role": "admin",
      "created_at": "2026-02-05T08:26:49.000Z"
    }
  ],
  "count": 1
}
```

### Get All Employees (Admin Only)

```http
GET /users/employees
```

**Response (200):**
```json
{
  "employees": [
    {
      "id": 2,
      "email": "john.doe@company.com",
      "full_name": "John Doe",
      "created_at": "2026-02-05T08:26:49.000Z",
      "shift_start": "22:00:00",
      "shift_end": "06:00:00",
      "timezone": "America/New_York",
      "total_tasks": 2,
      "completed_tasks": 0
    }
  ],
  "count": 1
}
```

### Get User by ID

```http
GET /users/:id
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "employee",
    "created_at": "2026-02-05T08:26:49.000Z",
    "updated_at": "2026-02-05T08:26:49.000Z"
  }
}
```

### Update User

```http
PUT /users/:id
```

**Request Body:**
```json
{
  "fullName": "John Updated Doe"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Updated Doe",
    "role": "employee",
    "updated_at": "2026-02-05T10:30:00.000Z"
  }
}
```

### Delete User (Admin Only)

```http
DELETE /users/:id
```

**Response (200):**
```json
{
  "message": "User deleted successfully."
}
```

---

## Tasks

### Get All Tasks

Admin sees all tasks, employees see only assigned tasks.

```http
GET /tasks
```

**Response (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Implement User Authentication API",
      "description": "Create JWT-based authentication endpoints",
      "assigned_to": 2,
      "assigned_to_name": "John Doe",
      "assigned_to_email": "john.doe@company.com",
      "created_by": 1,
      "created_by_name": "Administrator",
      "priority": "high",
      "status": "in_progress",
      "due_date": "2026-02-10T06:00:00.000Z",
      "shift_id": 1,
      "shift_start": "22:00:00",
      "shift_end": "06:00:00",
      "timezone": "America/New_York",
      "created_at": "2026-02-05T08:26:49.000Z",
      "updated_at": "2026-02-05T08:26:49.000Z"
    }
  ],
  "count": 1
}
```

### Get Task by ID

```http
GET /tasks/:id
```

### Create Task (Admin Only)

```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "assignedTo": 2,
  "priority": "high",
  "dueDate": "2026-02-15T06:00:00",
  "shiftId": 1
}
```

**Response (201):**
```json
{
  "message": "Task created successfully.",
  "task": {
    "id": 10,
    "title": "New Task",
    "description": "Task description",
    "assigned_to": 2,
    "created_by": 1,
    "priority": "high",
    "status": "pending",
    "due_date": "2026-02-15T06:00:00.000Z",
    "shift_id": 1,
    "created_at": "2026-02-05T10:30:00.000Z"
  }
}
```

### Update Task

```http
PUT /tasks/:id
```

Admin can update all fields, employees can only update status.

**Request Body (Admin):**
```json
{
  "title": "Updated Task",
  "description": "New description",
  "assignedTo": 3,
  "priority": "medium",
  "status": "completed",
  "dueDate": "2026-02-20T06:00:00"
}
```

**Request Body (Employee):**
```json
{
  "status": "in_progress"
}
```

### Update Task Status

```http
PATCH /tasks/:id/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Task status updated successfully.",
  "task": {
    "id": 1,
    "status": "completed",
    ...
  }
}
```

### Delete Task (Admin Only)

```http
DELETE /tasks/:id
```

**Response (200):**
```json
{
  "message": "Task deleted successfully."
}
```

---

## Shifts

### Get All Shifts

Admin sees all shifts, employees see only their own.

```http
GET /shifts
```

**Response (200):**
```json
{
  "shifts": [
    {
      "id": 1,
      "employee_id": 2,
      "full_name": "John Doe",
      "email": "john.doe@company.com",
      "shift_start": "22:00:00",
      "shift_end": "06:00:00",
      "timezone": "America/New_York",
      "is_active": true,
      "created_at": "2026-02-05T08:26:49.000Z"
    }
  ],
  "count": 1
}
```

### Get Active Shift for Employee

```http
GET /shifts/employee/:employeeId/active
```

**Response (200):**
```json
{
  "shift": {
    "id": 1,
    "employee_id": 2,
    "full_name": "John Doe",
    "shift_start": "22:00:00",
    "shift_end": "06:00:00",
    "timezone": "America/New_York",
    "is_active": true
  }
}
```

### Create Shift (Admin Only)

```http
POST /shifts
```

**Request Body:**
```json
{
  "employeeId": 2,
  "shiftStart": "22:00:00",
  "shiftEnd": "06:00:00",
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "message": "Shift created successfully.",
  "shift": {
    "id": 5,
    "employee_id": 2,
    "shift_start": "22:00:00",
    "shift_end": "06:00:00",
    "timezone": "America/New_York",
    "is_active": true,
    "created_at": "2026-02-05T10:30:00.000Z"
  }
}
```

### Update Shift (Admin Only)

```http
PUT /shifts/:id
```

**Request Body:**
```json
{
  "shiftStart": "23:00:00",
  "shiftEnd": "07:00:00",
  "timezone": "America/Chicago",
  "isActive": true
}
```

### Delete Shift (Admin Only)

```http
DELETE /shifts/:id
```

---

## Reports

### Get All Reports

Admin sees all reports, employees see only their own.

```http
GET /reports
```

**Response (200):**
```json
{
  "reports": [
    {
      "id": 1,
      "employee_id": 2,
      "employee_name": "John Doe",
      "employee_email": "john.doe@company.com",
      "task_id": 1,
      "task_title": "Implement User Authentication API",
      "report_date": "2026-02-04",
      "work_description": "Implemented JWT token generation and validation logic.",
      "time_spent": 300,
      "created_at": "2026-02-04T06:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Report by ID

```http
GET /reports/:id
```

### Get Reports by Employee (Admin Only)

```http
GET /reports/employee/:employeeId
```

### Get Reports by Date (Admin Only)

```http
GET /reports/date/:date
```

Example: `/reports/date/2026-02-05`

### Submit Report

```http
POST /reports
```

**Request Body:**
```json
{
  "taskId": 1,
  "workDescription": "Completed the authentication module and wrote unit tests.",
  "timeSpent": 240,
  "reportDate": "2026-02-05"
}
```

**Response (201):**
```json
{
  "message": "Daily report submitted successfully.",
  "report": {
    "id": 12,
    "employee_id": 2,
    "task_id": 1,
    "report_date": "2026-02-05",
    "work_description": "Completed the authentication module and wrote unit tests.",
    "time_spent": 240,
    "created_at": "2026-02-05T10:30:00.000Z"
  }
}
```

### Get Reports Statistics (Admin Only)

```http
GET /reports/stats
```

**Response (200):**
```json
{
  "statistics": {
    "total_reports": 11,
    "active_employees": 5,
    "tasks_reported_on": 10,
    "total_time_spent": 3015,
    "avg_time_spent": 274,
    "latest_report_date": "2026-02-05"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password are required."
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password."
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "error": "Task not found."
}
```

### 409 Conflict
```json
{
  "error": "User with this email already exists."
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred processing your request."
}
```

---

## Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Internal Server Error
