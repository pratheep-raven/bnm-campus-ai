# BNM Campus AI

BNM Campus AI is an AI-powered academic management web application designed for students, teachers, and administrators.

The application combines campus academic tools with Supabase authentication, PostgreSQL database management, real-time updates, and AI-powered academic assistance.

## Project Status

This project is currently under development.

Core frontend screens, Supabase database schema, authentication integration, role-based dashboards, and academic management modules have been implemented.

## User Roles

### Student

Students can:

- Register and sign in securely
- View assignments
- Submit assignment work
- View attendance records
- View internal assessment marks
- Access study materials
- Track academic projects
- Receive notifications
- Use the AI academic assistant

### Teacher

Teachers can:

- Manage assigned classes
- Create assignments
- Review student submissions
- Record attendance
- Schedule internal examinations
- Publish marks
- Upload study materials
- Manage academic projects
- Send student notifications

### Administrator

Administrators can:

- Manage departments
- Manage classes and subjects
- Manage student and teacher profiles
- Assign academic roles
- View academic system records
- Control institution-level data

## Main Features

- Email and password authentication
- Student, teacher, and administrator roles
- Role-based dashboards
- Assignment and submission management
- Attendance tracking
- Internal examination and marks management
- Study-material repository
- Academic project task tracking
- Real-time notifications
- AI academic assistant
- Supabase Row Level Security
- Secure file storage
- Empty-state messages
- Responsive web interface

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Realtime
- Row Level Security

### AI Integration

- Google Gemini API
- Server-side AI endpoints

## Database Tables

The Supabase database includes:

- profiles
- departments
- course_classes
- subjects
- class_enrollments
- assignments
- submissions
- attendance_sessions
- attendance_records
- exams
- marks
- study_materials
- projects
- project_members
- project_tasks
- notifications

## Security

The application uses Supabase Row Level Security policies.

- Students can access only their permitted academic records.
- Teachers can manage their assigned academic data.
- Administrators can manage institution-level records.
- Secret and service-role keys are never exposed in frontend code.
- No fake users, sample marks, demo attendance, or hardcoded dashboard statistics are included.

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
