-- Remote Work Management System - Seed Data
-- Sample data for testing

-- Clear existing data
TRUNCATE TABLE daily_reports, tasks, shifts, users RESTART IDENTITY CASCADE;

-- Insert sample users
-- Password for all users: 'password123' (hashed with bcrypt)
-- Hash generated: $2b$10$rH6L8KqXZqXZqXZqXZqXZu.YqY7qY7qY7qY7qY7qY7qY7qY7qY7qYe
-- Note: In production, passwords should be hashed by the application

INSERT INTO users (email, password_hash, full_name, role) VALUES
-- Admin user
('admin@company.com', '$2b$10$YourHashedPasswordHere', 'System Administrator', 'admin'),

-- Employee users
('john.doe@company.com', '$2b$10$YourHashedPasswordHere', 'John Doe', 'employee'),
('jane.smith@company.com', '$2b$10$YourHashedPasswordHere', 'Jane Smith', 'employee'),
('mike.wilson@company.com', '$2b$10$YourHashedPasswordHere', 'Mike Wilson', 'employee'),
('sarah.johnson@company.com', '$2b$10$YourHashedPasswordHere', 'Sarah Johnson', 'employee'),
('david.brown@company.com', '$2b$10$YourHashedPasswordHere', 'David Brown', 'employee');

-- Insert sample shifts (US Night Shifts)
-- Employee 2 (John Doe) - EST Night Shift
INSERT INTO shifts (employee_id, shift_start, shift_end, timezone, is_active) VALUES
(2, '22:00:00', '06:00:00', 'America/New_York', true),

-- Employee 3 (Jane Smith) - CST Night Shift
(3, '21:00:00', '05:00:00', 'America/Chicago', true),

-- Employee 4 (Mike Wilson) - PST Evening Shift
(4, '18:00:00', '02:00:00', 'America/Los_Angeles', true),

-- Employee 5 (Sarah Johnson) - EST Night Shift
(5, '23:00:00', '07:00:00', 'America/New_York', true),

-- Employee 6 (David Brown) - MST Night Shift
(6, '20:00:00', '04:00:00', 'America/Denver', true);

-- Insert sample tasks
INSERT INTO tasks (title, description, assigned_to, created_by, priority, status, due_date, shift_id) VALUES
-- Tasks assigned to John Doe
('Implement User Authentication API', 'Create JWT-based authentication endpoints for login and registration', 2, 1, 'high', 'in_progress', '2026-02-10 06:00:00', 1),
('Fix Database Connection Pool', 'Optimize PostgreSQL connection pool settings for better performance', 2, 1, 'medium', 'pending', '2026-02-08 06:00:00', 1),

-- Tasks assigned to Jane Smith
('Design Admin Dashboard UI', 'Create responsive admin dashboard with task management interface', 3, 1, 'high', 'in_progress', '2026-02-12 05:00:00', 2),
('Implement Report Export Feature', 'Add CSV export functionality for daily reports', 3, 1, 'low', 'pending', '2026-02-15 05:00:00', 2),

-- Tasks assigned to Mike Wilson
('Setup CI/CD Pipeline', 'Configure automated deployment pipeline using GitHub Actions', 4, 1, 'medium', 'completed', '2026-02-05 02:00:00', 3),
('Write API Documentation', 'Document all REST API endpoints with Swagger/OpenAPI', 4, 1, 'medium', 'in_progress', '2026-02-09 02:00:00', 3),

-- Tasks assigned to Sarah Johnson
('Implement Task Notification System', 'Send email notifications for task assignments and updates', 5, 1, 'high', 'pending', '2026-02-11 07:00:00', 4),
('Setup Database Backup System', 'Configure automated daily backups for PostgreSQL database', 5, 1, 'high', 'pending', '2026-02-07 07:00:00', 4),

-- Tasks assigned to David Brown
('Optimize Frontend Bundle Size', 'Reduce React app bundle size using code splitting and lazy loading', 6, 1, 'low', 'completed', '2026-02-04 04:00:00', 5),
('Add Unit Tests for Controllers', 'Write comprehensive unit tests for all backend controllers', 6, 1, 'medium', 'in_progress', '2026-02-13 04:00:00', 5);

-- Insert sample daily reports
INSERT INTO daily_reports (employee_id, task_id, report_date, work_description, time_spent) VALUES
-- John Doe's reports
(2, 1, '2026-02-04', 'Implemented JWT token generation and validation logic. Created middleware for authentication.', 300),
(2, 1, '2026-02-05', 'Added password hashing with bcrypt. Tested login and registration endpoints.', 280),

-- Jane Smith's reports
(3, 3, '2026-02-04', 'Created wireframes for admin dashboard. Started implementing the layout component.', 320),
(3, 3, '2026-02-05', 'Built sidebar navigation and header components. Integrated React Router.', 290),

-- Mike Wilson's reports
(4, 5, '2026-02-03', 'Researched CI/CD tools. Set up GitHub Actions workflow for automated testing.', 240),
(4, 5, '2026-02-04', 'Configured deployment to staging environment. Added automatic database migrations.', 310),
(4, 6, '2026-02-05', 'Started writing API documentation. Documented authentication and user endpoints.', 270),

-- Sarah Johnson's reports
(5, 7, '2026-02-05', 'Researched email service providers. Setup SendGrid account for email notifications.', 180),

-- David Brown's reports
(6, 9, '2026-02-03', 'Analyzed bundle size using webpack-bundle-analyzer. Identified large dependencies.', 200),
(6, 9, '2026-02-04', 'Implemented code splitting and lazy loading for route components. Reduced bundle by 40%.', 340),
(6, 10, '2026-02-05', 'Setup Jest testing framework. Wrote tests for authController and userController.', 295);

-- Create a view for task summary statistics
CREATE OR REPLACE VIEW task_statistics AS
SELECT 
    status,
    priority,
    COUNT(*) as task_count,
    COUNT(DISTINCT assigned_to) as employees_assigned
FROM tasks
GROUP BY status, priority
ORDER BY status, priority;

-- Create a view for employee workload
CREATE OR REPLACE VIEW employee_workload AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as pending_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as in_progress_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT dr.id) as total_reports
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
LEFT JOIN daily_reports dr ON u.id = dr.employee_id
WHERE u.role = 'employee'
GROUP BY u.id, u.full_name, u.email
ORDER BY u.full_name;

-- Success message
SELECT 'Seed data inserted successfully!' AS status;
SELECT 'Total users created: ' || COUNT(*) AS info FROM users;
SELECT 'Total tasks created: ' || COUNT(*) AS info FROM tasks;
SELECT 'Total shifts created: ' || COUNT(*) AS info FROM shifts;
SELECT 'Total reports created: ' || COUNT(*) AS info FROM daily_reports;
