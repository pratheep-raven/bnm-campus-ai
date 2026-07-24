-- ==============================================================================
-- BNM CAMPUS AI - COMPLETE SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    usn TEXT,
    department_id UUID,
    department_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    head_of_department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Course Classes Table
CREATE TABLE IF NOT EXISTS public.course_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    section TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Class Enrollments Table
CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.course_classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 7. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    class_id UUID REFERENCES public.course_classes(id) ON DELETE SET NULL,
    class_name TEXT NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    teacher_name TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 20,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_usn TEXT,
    submission_text TEXT NOT NULL,
    attachment_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'reviewed')),
    obtained_marks NUMERIC,
    teacher_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    UNIQUE(assignment_id, student_id)
);

-- 9. Attendance Sessions Table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.course_classes(id) ON DELETE SET NULL,
    class_name TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    teacher_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    topic_covered TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_usn TEXT,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- 11. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    class_id UUID REFERENCES public.course_classes(id) ON DELETE SET NULL,
    class_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    max_marks INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Marks Table
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    test_id UUID,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_usn TEXT,
    obtained_marks NUMERIC NOT NULL DEFAULT 0,
    max_marks NUMERIC NOT NULL DEFAULT 50,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- 13. Study Materials Table
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    unit_number INTEGER NOT NULL DEFAULT 1,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'PDF',
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    class_id UUID REFERENCES public.course_classes(id) ON DELETE SET NULL,
    class_name TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by_name TEXT NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Project Members Table
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, student_id)
);

-- 16. Project Tasks Table
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_student_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    related_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, usn, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'usn',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. DEPARTMENTS, CLASSES, SUBJECTS POLICIES
DROP POLICY IF EXISTS "Departments viewable by authenticated" ON public.departments;
CREATE POLICY "Departments viewable by authenticated" ON public.departments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Classes viewable by authenticated" ON public.course_classes;
CREATE POLICY "Classes viewable by authenticated" ON public.course_classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Subjects viewable by authenticated" ON public.subjects;
CREATE POLICY "Subjects viewable by authenticated" ON public.subjects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage departments" ON public.departments;
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins manage classes" ON public.course_classes;
CREATE POLICY "Admins manage classes" ON public.course_classes FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins manage subjects" ON public.subjects;
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. CLASS ENROLLMENTS POLICIES
DROP POLICY IF EXISTS "Enrollments viewable by authenticated" ON public.class_enrollments;
CREATE POLICY "Enrollments viewable by authenticated" ON public.class_enrollments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers and Admins manage enrollments" ON public.class_enrollments;
CREATE POLICY "Teachers and Admins manage enrollments" ON public.class_enrollments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 4. ASSIGNMENTS POLICIES
DROP POLICY IF EXISTS "Assignments viewable by authenticated" ON public.assignments;
CREATE POLICY "Assignments viewable by authenticated" ON public.assignments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers and Admins manage assignments" ON public.assignments;
CREATE POLICY "Teachers and Admins manage assignments" ON public.assignments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 5. SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "Students view own submissions, staff view all" ON public.submissions;
CREATE POLICY "Students view own submissions, staff view all" ON public.submissions FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

DROP POLICY IF EXISTS "Students insert own submissions" ON public.submissions;
CREATE POLICY "Students insert own submissions" ON public.submissions FOR INSERT TO authenticated WITH CHECK (
    student_id = auth.uid()
);

DROP POLICY IF EXISTS "Students update own submission, staff grade submission" ON public.submissions;
CREATE POLICY "Students update own submission, staff grade submission" ON public.submissions FOR UPDATE TO authenticated USING (
    student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 6. ATTENDANCE SESSIONS & RECORDS POLICIES
DROP POLICY IF EXISTS "Attendance sessions viewable by authenticated" ON public.attendance_sessions;
CREATE POLICY "Attendance sessions viewable by authenticated" ON public.attendance_sessions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers and Admins manage sessions" ON public.attendance_sessions;
CREATE POLICY "Teachers and Admins manage sessions" ON public.attendance_sessions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

DROP POLICY IF EXISTS "Students view own attendance records, staff view all" ON public.attendance_records;
CREATE POLICY "Students view own attendance records, staff view all" ON public.attendance_records FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

DROP POLICY IF EXISTS "Teachers and Admins manage attendance records" ON public.attendance_records;
CREATE POLICY "Teachers and Admins manage attendance records" ON public.attendance_records FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 7. EXAMS & MARKS POLICIES
DROP POLICY IF EXISTS "Exams viewable by authenticated" ON public.exams;
CREATE POLICY "Exams viewable by authenticated" ON public.exams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers and Admins manage exams" ON public.exams;
CREATE POLICY "Teachers and Admins manage exams" ON public.exams FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

DROP POLICY IF EXISTS "Students view own marks, staff view all" ON public.marks;
CREATE POLICY "Students view own marks, staff view all" ON public.marks FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

DROP POLICY IF EXISTS "Teachers and Admins manage marks" ON public.marks;
CREATE POLICY "Teachers and Admins manage marks" ON public.marks FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 8. STUDY MATERIALS POLICIES
DROP POLICY IF EXISTS "Study materials viewable by authenticated" ON public.study_materials;
CREATE POLICY "Study materials viewable by authenticated" ON public.study_materials FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers and Admins manage study materials" ON public.study_materials;
CREATE POLICY "Teachers and Admins manage study materials" ON public.study_materials FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 9. PROJECTS POLICIES
DROP POLICY IF EXISTS "Projects viewable by authenticated" ON public.projects;
CREATE POLICY "Projects viewable by authenticated" ON public.projects FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff or project creator manage projects" ON public.projects;
CREATE POLICY "Staff or project creator manage projects" ON public.projects FOR ALL TO authenticated USING (
    created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

DROP POLICY IF EXISTS "Project members viewable by authenticated" ON public.project_members;
CREATE POLICY "Project members viewable by authenticated" ON public.project_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff or project creator manage project members" ON public.project_members;
CREATE POLICY "Staff or project creator manage project members" ON public.project_members FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND created_by = auth.uid())
);

DROP POLICY IF EXISTS "Project tasks viewable by authenticated" ON public.project_tasks;
CREATE POLICY "Project tasks viewable by authenticated" ON public.project_tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Assigned student, creator or staff manage tasks" ON public.project_tasks;
CREATE POLICY "Assigned student, creator or staff manage tasks" ON public.project_tasks FOR ALL TO authenticated USING (
    assigned_student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 10. NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users view own or global notifications" ON public.notifications;
CREATE POLICY "Users view own or global notifications" ON public.notifications FOR SELECT TO authenticated USING (
    target_user_id IS NULL OR target_user_id = auth.uid()
);

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (
    target_user_id IS NULL OR target_user_id = auth.uid()
);

-- ==============================================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('campus-files', 'campus-files', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Campus Files" ON storage.objects;
CREATE POLICY "Public Read Campus Files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'campus-files');

DROP POLICY IF EXISTS "Authenticated Upload Campus Files" ON storage.objects;
CREATE POLICY "Authenticated Upload Campus Files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'campus-files');
