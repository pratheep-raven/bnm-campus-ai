export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  departmentId: string;
  departmentName: string;
  // Student specific
  usn?: string; // University Seat Number (e.g. 1BG21CS042)
  classId?: string;
  className?: string;
  semester?: number;
  section?: string;
  // Teacher specific
  facultyId?: string;
  designation?: string;
  handledSubjects?: string[]; // Subject IDs
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
}

export interface CourseClass {
  id: string;
  departmentId: string;
  name: string; // e.g. "5th Sem CSE-A"
  semester: number;
  section: string;
  academicYear: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "21CS51"
  name: string; // e.g. "Automata Theory & Computability"
  departmentId: string;
  semester: number;
  credits: number;
  teacherId?: string;
  teacherName?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  dueDate: string; // ISO String
  maxMarks: number;
  attachmentUrl?: string;
  createdAt: string;
}

export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'reviewed';

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentUsn: string;
  submissionText: string;
  attachmentUrl?: string;
  submittedAt: string;
  status: SubmissionStatus;
  obtainedMarks?: number;
  teacherFeedback?: string;
  reviewedAt?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  topicCovered: string;
  totalStudents: number;
  presentCount: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentUsn: string;
  status: AttendanceStatus;
}

export interface Test {
  id: string;
  title: string; // e.g. "Internal Assessment 1"
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  testDate: string;
  maxMarks: number;
  durationMinutes: number;
  syllabusCovered: string;
  isPublished: boolean;
  createdAt: string;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  studentUsn: string;
  obtainedMarks: number;
  remarks?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  unitNumber: number;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'slides' | 'link';
  uploadedBy: string;
  teacherName: string;
  uploadedAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedStudentId: string;
  assignedStudentName: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  dueDate: string;
  assignedStudentIds: string[];
  tasks: ProjectTask[];
  repositoryUrl?: string;
  status: 'planning' | 'active' | 'under_review' | 'completed';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  targetUserId?: string; // empty means broadcast to class/role
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'assignment' | 'attendance' | 'marks' | 'test' | 'material' | 'project' | 'system';
  relatedId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  agentName?: string;
  text: string;
  timestamp: string;
  suggestedAction?: string;
}

export interface AIProgressReport {
  overallPercentage: number;
  attendanceRisk: boolean;
  lowAttendanceSubjects: string[];
  pendingAssignmentsCount: number;
  avgTestScore: number;
  strengths: string[];
  recommendations: string[];
  aiSummary: string;
}
