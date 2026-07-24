import { supabase, isSupabaseConfigured, formatSupabaseError } from '../lib/supabase';
import {
  User,
  Department,
  CourseClass,
  Subject,
  Assignment,
  Submission,
  AttendanceSession,
  AttendanceRecord,
  Test,
  TestResult,
  StudyMaterial,
  Project,
  ProjectTask,
  NotificationItem,
  AIChatMessage,
  AIProgressReport
} from '../types';

export const api = {
  // Check if Supabase connection configured
  isConfigured: () => isSupabaseConfigured(),

  // Auth Operations
  getCurrentUser: async (): Promise<User | null> => {
    if (!isSupabaseConfigured()) return null;
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email || user.email || '',
      name: profile.name || 'User',
      role: profile.role || 'student',
      usn: profile.usn || '',
      avatarUrl: profile.avatar_url || '',
      departmentId: profile.department_id || '',
      departmentName: profile.department_name || ''
    };
  },

  signUp: async (payload: { email: string; password: string; name: string; role: 'student' | 'teacher' | 'admin'; usn?: string }) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase credentials are not configured.');
    }
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          role: payload.role,
          usn: payload.usn || ''
        }
      }
    });

    if (error) throw new Error(formatSupabaseError(error));

    if (data.user) {
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        usn: payload.usn || null
      });
      if (profileErr) {
        console.error('Profile creation error:', formatSupabaseError(profileErr));
      }
    }

    return data;
  },

  signIn: async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase credentials are not configured.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(formatSupabaseError(error));
    return data;
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', formatSupabaseError(err));
    }
  },

  // Initial Data Loader
  getInitialData: async () => {
    if (!isSupabaseConfigured()) {
      return {
        users: [],
        departments: [],
        classes: [],
        subjects: [],
        assignments: [],
        submissions: [],
        attendanceSessions: [],
        attendanceRecords: [],
        tests: [],
        testResults: [],
        materials: [],
        projects: [],
        notifications: []
      };
    }

    const [
      usersRes,
      deptsRes,
      classesRes,
      subjectsRes,
      assignmentsRes,
      submissionsRes,
      attendanceSessionsRes,
      attendanceRecordsRes,
      testsRes,
      marksRes,
      materialsRes,
      projectsRes,
      projectTasksRes,
      projectMembersRes,
      notificationsRes
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('departments').select('*').order('name'),
      supabase.from('course_classes').select('*').order('name'),
      supabase.from('subjects').select('*').order('name'),
      supabase.from('assignments').select('*').order('created_at', { ascending: false }),
      supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('attendance_sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('attendance_records').select('*'),
      supabase.from('exams').select('*').order('created_at', { ascending: false }),
      supabase.from('marks').select('*'),
      supabase.from('study_materials').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('project_tasks').select('*'),
      supabase.from('project_members').select('*'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false })
    ]);

    const users: User[] = (usersRes.data || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role,
      usn: p.usn,
      avatarUrl: p.avatar_url,
      departmentId: p.department_id || '',
      departmentName: p.department_name || ''
    }));

    const departments: Department[] = (deptsRes.data || []).map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      headOfDepartment: d.head_of_department || ''
    }));

    const classes: CourseClass[] = (classesRes.data || []).map(c => ({
      id: c.id,
      departmentId: c.department_id,
      name: c.name,
      semester: c.semester,
      section: c.section,
      academicYear: '2025-2026'
    }));

    const subjects: Subject[] = (subjectsRes.data || []).map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      departmentId: s.department_id,
      semester: 5,
      credits: s.credits || 4
    }));

    const assignments: Assignment[] = (assignmentsRes.data || []).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      subjectId: a.subject_id || '',
      subjectName: a.subject_name || '',
      classId: a.class_id || '',
      className: a.class_name || '',
      teacherId: a.teacher_id || '',
      teacherName: a.teacher_name || '',
      dueDate: a.due_date,
      maxMarks: a.max_marks || 20,
      attachmentUrl: a.attachment_url || '',
      createdAt: a.created_at
    }));

    const submissions: Submission[] = (submissionsRes.data || []).map(s => ({
      id: s.id,
      assignmentId: s.assignment_id,
      studentId: s.student_id,
      studentName: s.student_name,
      studentUsn: s.student_usn || '',
      submissionText: s.submission_text || '',
      attachmentUrl: s.attachment_url || '',
      submittedAt: s.submitted_at,
      status: s.status,
      obtainedMarks: s.obtained_marks !== null ? Number(s.obtained_marks) : undefined,
      teacherFeedback: s.teacher_feedback || '',
      reviewedAt: s.reviewed_at || undefined
    }));

    const attendanceSessions: AttendanceSession[] = (attendanceSessionsRes.data || []).map(s => ({
      id: s.id,
      classId: s.class_id || '',
      className: s.class_name || '',
      subjectId: s.subject_id || '',
      subjectName: s.subject_name || '',
      teacherId: s.teacher_id || '',
      teacherName: s.teacher_name || '',
      date: s.date,
      topicCovered: s.topic_covered || '',
      totalStudents: (attendanceRecordsRes.data || []).filter(r => r.session_id === s.id).length,
      presentCount: (attendanceRecordsRes.data || []).filter(r => r.session_id === s.id && (r.status === 'present' || r.status === 'late')).length,
      createdAt: s.created_at
    }));

    const attendanceRecords: AttendanceRecord[] = (attendanceRecordsRes.data || []).map(r => ({
      id: r.id,
      sessionId: r.session_id,
      studentId: r.student_id,
      studentName: r.student_name,
      studentUsn: r.student_usn || '',
      status: r.status
    }));

    const tests: Test[] = (testsRes.data || []).map(t => ({
      id: t.id,
      title: t.title,
      subjectId: t.subject_id || '',
      subjectName: t.subject_name || '',
      classId: t.class_id || '',
      className: t.class_name || '',
      teacherId: '',
      teacherName: 'Faculty',
      testDate: t.date,
      maxMarks: t.max_marks || 50,
      durationMinutes: 60,
      syllabusCovered: 'Full Syllabus',
      isPublished: true,
      createdAt: t.created_at
    }));

    const testResults: TestResult[] = (marksRes.data || []).map(m => ({
      id: m.id,
      testId: m.exam_id,
      studentId: m.student_id,
      studentName: m.student_name,
      studentUsn: m.student_usn || '',
      obtainedMarks: Number(m.obtained_marks || 0),
      remarks: m.remarks || ''
    }));

    const materials: StudyMaterial[] = (materialsRes.data || []).map(m => ({
      id: m.id,
      title: m.title,
      description: m.description || '',
      subjectId: m.subject_id || '',
      subjectName: m.subject_name || '',
      unitNumber: m.unit_number || 1,
      fileUrl: m.file_url,
      fileType: (m.file_type || 'pdf').toLowerCase() as any,
      uploadedBy: m.uploaded_by || '',
      teacherName: m.uploaded_by_name || 'Faculty',
      uploadedAt: m.created_at
    }));

    const rawTasks = projectTasksRes.data || [];
    const rawMembers = projectMembersRes.data || [];

    const projects: Project[] = (projectsRes.data || []).map(p => {
      const pTasks: ProjectTask[] = rawTasks.filter(t => t.project_id === p.id).map(t => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        assignedStudentId: t.assigned_student_id || '',
        assignedStudentName: t.assigned_student_name || '',
        status: t.status,
        dueDate: p.due_date
      }));

      const pMemberStudentIds = rawMembers.filter(m => m.project_id === p.id).map(m => m.student_id);

      return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        subjectId: p.subject_id || '',
        subjectName: p.subject_name || '',
        classId: p.class_id || '',
        className: p.class_name || '',
        teacherId: p.created_by || '',
        teacherName: p.created_by_name || 'Faculty',
        dueDate: p.due_date,
        assignedStudentIds: pMemberStudentIds,
        tasks: pTasks,
        status: 'active',
        createdAt: p.created_at
      };
    });

    const notifications: NotificationItem[] = (notificationsRes.data || []).map(n => ({
      id: n.id,
      targetUserId: n.target_user_id || undefined,
      title: n.title,
      message: n.message,
      type: (n.type || 'system') as any,
      relatedId: n.related_id || undefined,
      createdAt: n.created_at,
      isRead: n.is_read ?? false
    }));

    return {
      users,
      departments,
      classes,
      subjects,
      assignments,
      submissions,
      attendanceSessions,
      attendanceRecords,
      tests,
      testResults,
      materials,
      projects,
      notifications
    };
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('profiles').select('*').order('name');
    return (data || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role,
      usn: p.usn,
      avatarUrl: p.avatar_url,
      departmentId: p.department_id || '',
      departmentName: p.department_name || ''
    }));
  },

  // Catalog
  getDepartments: async (): Promise<Department[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('departments').select('*').order('name');
    return (data || []).map(d => ({
      id: d.id,
      code: d.code,
      name: d.name,
      headOfDepartment: d.head_of_department || ''
    }));
  },

  createDepartment: async (payload: { name: string; code: string; headOfDepartment?: string }) => {
    const { data, error } = await supabase.from('departments').insert({
      name: payload.name,
      code: payload.code,
      head_of_department: payload.headOfDepartment || null
    }).select().single();
    if (error) throw error;
    return data;
  },

  getClasses: async (): Promise<CourseClass[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('course_classes').select('*').order('name');
    return (data || []).map(c => ({
      id: c.id,
      departmentId: c.department_id,
      name: c.name,
      semester: c.semester,
      section: c.section,
      academicYear: '2025-2026'
    }));
  },

  createClass: async (payload: { name: string; departmentId: string; semester: number; section: string }) => {
    const { data, error } = await supabase.from('course_classes').insert({
      name: payload.name,
      department_id: payload.departmentId,
      semester: payload.semester,
      section: payload.section
    }).select().single();
    if (error) throw error;
    return data;
  },

  getSubjects: async (): Promise<Subject[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('subjects').select('*').order('name');
    return (data || []).map(s => ({
      id: s.id,
      code: s.code,
      name: s.name,
      departmentId: s.department_id,
      semester: 5,
      credits: s.credits || 4
    }));
  },

  createSubject: async (payload: { name: string; code: string; departmentId: string; credits?: number }) => {
    const { data, error } = await supabase.from('subjects').insert({
      name: payload.name,
      code: payload.code,
      department_id: payload.departmentId,
      credits: payload.credits || 4
    }).select().single();
    if (error) throw error;
    return data;
  },

  // Assignments
  createAssignment: async (payload: Partial<Assignment>) => {
    const { data, error } = await supabase.from('assignments').insert({
      title: payload.title,
      description: payload.description || '',
      subject_id: payload.subjectId,
      subject_name: payload.subjectName,
      class_id: payload.classId,
      class_name: payload.className,
      teacher_id: payload.teacherId,
      teacher_name: payload.teacherName,
      due_date: payload.dueDate,
      max_marks: payload.maxMarks || 20,
      attachment_url: payload.attachmentUrl || null
    }).select().single();

    if (error) throw error;

    // Send broadcast notification for new assignment
    await supabase.from('notifications').insert({
      title: 'New Assignment Published',
      message: `${payload.teacherName} assigned "${payload.title}" for ${payload.subjectName}. Due: ${new Date(payload.dueDate!).toLocaleDateString()}`,
      type: 'assignment',
      related_id: data.id
    });

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      subjectId: data.subject_id,
      subjectName: data.subject_name,
      classId: data.class_id,
      className: data.class_name,
      teacherId: data.teacher_id,
      teacherName: data.teacher_name,
      dueDate: data.due_date,
      maxMarks: data.max_marks,
      attachmentUrl: data.attachment_url || '',
      createdAt: data.created_at
    };
  },

  // Submissions
  submitAssignment: async (payload: Partial<Submission>) => {
    const { data, error } = await supabase.from('submissions').upsert({
      assignment_id: payload.assignmentId,
      student_id: payload.studentId,
      student_name: payload.studentName,
      student_usn: payload.studentUsn || '',
      submission_text: payload.submissionText,
      attachment_url: payload.attachmentUrl || null,
      status: 'submitted'
    }, { onConflict: 'assignment_id,student_id' }).select().single();

    if (error) throw error;

    // Send notification
    await supabase.from('notifications').insert({
      title: 'New Student Submission',
      message: `${payload.studentName} (${payload.studentUsn || 'Student'}) submitted assignment response.`,
      type: 'assignment',
      related_id: payload.assignmentId
    });

    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      studentName: data.student_name,
      studentUsn: data.student_usn,
      submissionText: data.submission_text,
      attachmentUrl: data.attachment_url || '',
      submittedAt: data.submitted_at,
      status: data.status,
      obtainedMarks: data.obtained_marks !== null ? Number(data.obtained_marks) : undefined,
      teacherFeedback: data.teacher_feedback || ''
    };
  },

  reviewSubmission: async (submissionId: string, obtainedMarks: number, teacherFeedback: string) => {
    const { data, error } = await supabase.from('submissions').update({
      obtained_marks: obtainedMarks,
      teacher_feedback: teacherFeedback,
      status: 'reviewed',
      reviewed_at: new Date().toISOString()
    }).eq('id', submissionId).select().single();

    if (error) throw error;

    // Notify student
    await supabase.from('notifications').insert({
      target_user_id: data.student_id,
      title: 'Assignment Marks Reviewed',
      message: `Your assignment submission was reviewed and awarded ${obtainedMarks} marks.`,
      type: 'marks',
      related_id: data.assignment_id
    });

    return {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      studentName: data.student_name,
      studentUsn: data.student_usn,
      submissionText: data.submission_text,
      attachmentUrl: data.attachment_url || '',
      submittedAt: data.submitted_at,
      status: data.status,
      obtainedMarks: Number(data.obtained_marks),
      teacherFeedback: data.teacher_feedback,
      reviewedAt: data.reviewed_at
    };
  },

  // Attendance
  createAttendanceSession: async (payload: {
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    date: string;
    topicCovered: string;
    records: { studentId: string; studentName: string; studentUsn: string; status: string }[];
  }) => {
    const { data: sess, error: sessErr } = await supabase.from('attendance_sessions').insert({
      class_id: payload.classId,
      class_name: payload.className,
      subject_id: payload.subjectId,
      subject_name: payload.subjectName,
      teacher_id: payload.teacherId,
      teacher_name: payload.teacherName,
      date: payload.date,
      topic_covered: payload.topicCovered
    }).select().single();

    if (sessErr) throw sessErr;

    const recordsPayload = payload.records.map(r => ({
      session_id: sess.id,
      student_id: r.studentId,
      student_name: r.studentName,
      student_usn: r.studentUsn,
      status: r.status
    }));

    const { data: recs, error: recsErr } = await supabase.from('attendance_records').insert(recordsPayload).select();
    if (recsErr) throw recsErr;

    return {
      session: {
        id: sess.id,
        classId: sess.class_id,
        className: sess.class_name,
        subjectId: sess.subject_id,
        subjectName: sess.subject_name,
        teacherId: sess.teacher_id,
        teacherName: sess.teacher_name,
        date: sess.date,
        topicCovered: sess.topic_covered,
        totalStudents: payload.records.length,
        presentCount: payload.records.filter(r => r.status === 'present' || r.status === 'late').length,
        createdAt: sess.created_at
      },
      records: (recs || []).map(r => ({
        id: r.id,
        sessionId: r.session_id,
        studentId: r.student_id,
        studentName: r.student_name,
        studentUsn: r.student_usn,
        status: r.status
      }))
    };
  },

  // Exams & Marks
  createTest: async (payload: Partial<Test>) => {
    const { data, error } = await supabase.from('exams').insert({
      title: payload.title,
      subject_id: payload.subjectId,
      subject_name: payload.subjectName,
      class_id: payload.classId,
      class_name: payload.className,
      date: payload.testDate,
      max_marks: payload.maxMarks || 50
    }).select().single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      subjectId: data.subject_id,
      subjectName: data.subject_name,
      classId: data.class_id,
      className: data.class_name,
      teacherId: '',
      teacherName: 'Faculty',
      testDate: data.date,
      maxMarks: data.max_marks,
      durationMinutes: 60,
      syllabusCovered: 'Full Syllabus',
      isPublished: true,
      createdAt: data.created_at
    };
  },

  recordTestResults: async (examId: string, resultsPayload: { studentId: string; studentName: string; studentUsn: string; obtainedMarks: number; remarks: string }[]) => {
    const dbPayload = resultsPayload.map(r => ({
      exam_id: examId,
      student_id: r.studentId,
      student_name: r.studentName,
      student_usn: r.studentUsn,
      obtained_marks: r.obtainedMarks,
      remarks: r.remarks
    }));

    const { data, error } = await supabase.from('marks').upsert(dbPayload, { onConflict: 'exam_id,student_id' }).select();
    if (error) throw error;

    return (data || []).map(m => ({
      id: m.id,
      testId: m.exam_id,
      studentId: m.student_id,
      studentName: m.student_name,
      studentUsn: m.student_usn,
      obtainedMarks: Number(m.obtained_marks),
      remarks: m.remarks
    }));
  },

  // Study Materials
  createStudyMaterial: async (payload: Partial<StudyMaterial>) => {
    const { data, error } = await supabase.from('study_materials').insert({
      title: payload.title,
      description: payload.description || '',
      subject_id: payload.subjectId,
      subject_name: payload.subjectName,
      unit_number: payload.unitNumber || 1,
      file_url: payload.fileUrl,
      file_type: payload.fileType || 'pdf',
      uploaded_by: payload.uploadedBy,
      uploaded_by_name: payload.teacherName || 'Faculty'
    }).select().single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      subjectId: data.subject_id,
      subjectName: data.subject_name,
      unitNumber: data.unit_number,
      fileUrl: data.file_url,
      fileType: data.file_type.toLowerCase(),
      uploadedBy: data.uploaded_by,
      teacherName: data.uploaded_by_name,
      uploadedAt: data.created_at
    };
  },

  // Projects
  createProject: async (payload: Partial<Project>) => {
    const { data: proj, error: projErr } = await supabase.from('projects').insert({
      title: payload.title,
      description: payload.description || '',
      subject_id: payload.subjectId,
      subject_name: payload.subjectName,
      class_id: payload.classId,
      class_name: payload.className,
      created_by: payload.teacherId,
      created_by_name: payload.teacherName || 'Faculty',
      due_date: payload.dueDate
    }).select().single();

    if (projErr) throw projErr;

    // Members
    if (payload.assignedStudentIds && payload.assignedStudentIds.length > 0) {
      await supabase.from('project_members').insert(
        payload.assignedStudentIds.map(stId => ({ project_id: proj.id, student_id: stId }))
      );
    }

    // Tasks
    let createdTasks: ProjectTask[] = [];
    if (payload.tasks && payload.tasks.length > 0) {
      const { data: tskData } = await supabase.from('project_tasks').insert(
        payload.tasks.map(t => ({
          project_id: proj.id,
          title: t.title,
          assigned_student_id: t.assignedStudentId,
          assigned_student_name: t.assignedStudentName,
          status: 'todo'
        }))
      ).select();

      createdTasks = (tskData || []).map(t => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        assignedStudentId: t.assigned_student_id,
        assignedStudentName: t.assigned_student_name,
        status: t.status,
        dueDate: proj.due_date
      }));
    }

    return {
      id: proj.id,
      title: proj.title,
      description: proj.description || '',
      subjectId: proj.subject_id,
      subjectName: proj.subject_name,
      classId: proj.class_id,
      className: proj.class_name,
      teacherId: proj.created_by,
      teacherName: proj.created_by_name,
      dueDate: proj.due_date,
      assignedStudentIds: payload.assignedStudentIds || [],
      tasks: createdTasks,
      status: 'active',
      createdAt: proj.created_at
    };
  },

  updateTaskStatus: async (projectId: string, taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    const { data, error } = await supabase.from('project_tasks').update({ status })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    // Get updated full project
    const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const { data: tasks } = await supabase.from('project_tasks').select('*').eq('project_id', projectId);
    const { data: members } = await supabase.from('project_members').select('*').eq('project_id', projectId);

    return {
      id: proj.id,
      title: proj.title,
      description: proj.description || '',
      subjectId: proj.subject_id,
      subjectName: proj.subject_name,
      classId: proj.class_id,
      className: proj.class_name,
      teacherId: proj.created_by,
      teacherName: proj.created_by_name,
      dueDate: proj.due_date,
      assignedStudentIds: (members || []).map(m => m.student_id),
      tasks: (tasks || []).map(t => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        assignedStudentId: t.assigned_student_id,
        assignedStudentName: t.assigned_student_name,
        status: t.status,
        dueDate: proj.due_date
      })),
      status: 'active',
      createdAt: proj.created_at
    };
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    return (data || []).map(n => ({
      id: n.id,
      targetUserId: n.target_user_id || undefined,
      title: n.title,
      message: n.message,
      type: n.type as any,
      relatedId: n.related_id || undefined,
      createdAt: n.created_at,
      isRead: n.is_read ?? false
    }));
  },

  markNotificationsRead: async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  },

  // AI & Services
  sendAiChat: async (message: string, role: string, mode?: string, context?: any): Promise<{ agentName: string; text: string }> => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, role, context, mode })
    });
    return res.json();
  },

  sendAIChat: async (message: string, role: string, mode?: string, context?: any) => {
    return api.sendAiChat(message, role, mode, context);
  },

  getAiProgressAnalysis: async (studentName: string, attendancePct: number, avgMarks: number, pendingAssignmentsCount: number): Promise<AIProgressReport> => {
    const res = await fetch('/api/ai/analyze-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName, attendancePct, avgMarks, pendingAssignmentsCount })
    });
    return res.json();
  },

  getAIProgressAnalysis: async (studentName: string, attendancePct: number, avgMarks: number, pendingAssignmentsCount: number) => {
    return api.getAiProgressAnalysis(studentName, attendancePct, avgMarks, pendingAssignmentsCount);
  }
};
