import React, { useEffect, useState } from 'react';
import {
  User,
  Assignment,
  Submission,
  AttendanceSession,
  AttendanceRecord,
  Test,
  TestResult,
  StudyMaterial,
  Project,
  NotificationItem,
  Department,
  CourseClass,
  Subject
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AssignmentsView } from './components/AssignmentsView';
import { AttendanceView } from './components/AttendanceView';
import { MarksView } from './components/MarksView';
import { StudyMaterialsView } from './components/StudyMaterialsView';
import { ProjectsView } from './components/ProjectsView';
import { AIAssistantView } from './components/AIAssistantView';
import { NotificationsView } from './components/NotificationsView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import {
  CreateAssignmentModal,
  SubmitAssignmentModal,
  CreateAttendanceModal,
  CreateTestModal,
  CreateMaterialModal,
  CreateProjectModal
} from './components/CreateModals';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);

  // Core Data State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Modals state
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showSubmitModalAssignment, setShowSubmitModalAssignment] = useState<Assignment | null>(null);
  const [showCreateAttendanceModal, setShowCreateAttendanceModal] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showCreateMaterialModal, setShowCreateMaterialModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const user = await api.getCurrentUser();
      setCurrentUser(user);

      const data = await api.getInitialData();
      setAllUsers(data.users || []);
      setAssignments(data.assignments || []);
      setSubmissions(data.submissions || []);
      setAttendanceSessions(data.attendanceSessions || []);
      setAttendanceRecords(data.attendanceRecords || []);
      setTests(data.tests || []);
      setTestResults(data.testResults || []);
      setMaterials(data.materials || []);
      setProjects(data.projects || []);
      setNotifications(data.notifications || []);
      setDepartments(data.departments || []);
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error('Failed to load initial BNM Campus data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = async () => {
    await api.signOut();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Connecting to Supabase PostgreSQL Database...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onSuccess={loadData} />;
  }

  // Handlers
  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
    // If switching user, auto switch tab if admin tab not accessible
    if (user.role !== 'admin' && activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  };

  const handleMarkNotificationsRead = async () => {
    await api.markNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleCreateAssignment = async (data: Partial<Assignment>) => {
    const created = await api.createAssignment(data);
    setAssignments(prev => [created, ...prev]);
    // refresh notifications
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleSubmitAssignment = async (data: Partial<Submission>) => {
    const subm = await api.submitAssignment(data);
    setSubmissions(prev => [subm, ...prev]);
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleReviewSubmission = async (submissionId: string, marks: number, feedback: string) => {
    const updated = await api.reviewSubmission(submissionId, marks, feedback);
    setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleCreateAttendance = async (data: any) => {
    const res = await api.createAttendanceSession(data);
    setAttendanceSessions(prev => [res.session, ...prev]);
    setAttendanceRecords(prev => [...res.records, ...prev]);
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleCreateTest = async (data: Partial<Test>) => {
    const created = await api.createTest(data);
    setTests(prev => [created, ...prev]);
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleRecordTestResults = async (testId: string, resultsPayload: any[]) => {
    const newResults = await api.recordTestResults(testId, resultsPayload);
    setTestResults(prev => [...(prev || []).filter(r => r.testId !== testId), ...newResults]);
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleCreateMaterial = async (data: Partial<StudyMaterial>) => {
    const created = await api.createStudyMaterial(data);
    setMaterials(prev => [created, ...prev]);
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    const created = await api.createProject(data);
    setProjects(prev => [created, ...prev]);
    const freshNotifs = await api.getNotifications();
    setNotifications(freshNotifs);
  };

  const handleUpdateTaskStatus = async (projectId: string, taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    const updatedProj = await api.updateTaskStatus(projectId, taskId, status);
    setProjects(prev => (prev || []).map(p => p.id === updatedProj.id ? updatedProj : p));
  };

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers || []}
        onUserSwitch={handleUserSwitch}
        notifications={notifications || []}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onRefreshData={loadData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadNotificationCount={unreadCount}
        />

        {/* Dynamic Center View */}
        <main className="flex-1 min-w-0">
          
          {activeTab === 'dashboard' && (
            currentUser.role === 'teacher' ? (
              <TeacherDashboard
                currentUser={currentUser}
                classes={classes}
                subjects={subjects}
                assignments={assignments}
                submissions={submissions}
                attendanceSessions={attendanceSessions}
                tests={tests}
                materials={materials}
                projects={projects}
                allStudents={(allUsers || []).filter(u => u.role === 'student')}
                setActiveTab={setActiveTab}
                onOpenCreateAssignment={() => setShowCreateAssignmentModal(true)}
                onOpenCreateAttendance={() => setShowCreateAttendanceModal(true)}
                onOpenCreateTest={() => setShowCreateTestModal(true)}
                onOpenCreateMaterial={() => setShowCreateMaterialModal(true)}
                onOpenCreateProject={() => setShowCreateProjectModal(true)}
                onReviewSubmission={handleReviewSubmission}
              />
            ) : (
              <StudentDashboard
                currentUser={currentUser}
                assignments={assignments}
                submissions={submissions}
                attendanceSessions={attendanceSessions}
                attendanceRecords={attendanceRecords}
                tests={tests}
                testResults={testResults}
                materials={materials}
                projects={projects}
                notifications={notifications}
                setActiveTab={setActiveTab}
                onOpenSubmitModal={(asgn) => setShowSubmitModalAssignment(asgn)}
              />
            )
          )}

          {activeTab === 'assignments' && (
            <AssignmentsView
              currentUser={currentUser}
              assignments={assignments}
              submissions={submissions}
              subjects={subjects}
              classes={classes}
              onOpenCreateAssignment={() => setShowCreateAssignmentModal(true)}
              onOpenSubmitModal={(asgn) => setShowSubmitModalAssignment(asgn)}
              onOpenReviewModal={() => {}}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              currentUser={currentUser}
              attendanceSessions={attendanceSessions}
              attendanceRecords={attendanceRecords}
              classes={classes}
              subjects={subjects}
              allStudents={(allUsers || []).filter(u => u.role === 'student')}
              onOpenCreateAttendance={() => setShowCreateAttendanceModal(true)}
            />
          )}

          {activeTab === 'marks' && (
            <MarksView
              currentUser={currentUser}
              tests={tests}
              testResults={testResults}
              subjects={subjects}
              classes={classes}
              allStudents={(allUsers || []).filter(u => u.role === 'student')}
              onOpenCreateTest={() => setShowCreateTestModal(true)}
              onRecordTestResults={handleRecordTestResults}
            />
          )}

          {activeTab === 'materials' && (
            <StudyMaterialsView
              currentUser={currentUser}
              materials={materials}
              subjects={subjects}
              onOpenCreateMaterial={() => setShowCreateMaterialModal(true)}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              currentUser={currentUser}
              projects={projects}
              subjects={subjects}
              classes={classes}
              allStudents={(allUsers || []).filter(u => u.role === 'student')}
              onOpenCreateProject={() => setShowCreateProjectModal(true)}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {activeTab === 'ai_assistant' && (
            <AIAssistantView currentUser={currentUser} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkNotificationsRead={handleMarkNotificationsRead}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              departments={departments}
              classes={classes}
              subjects={subjects}
              allUsers={allUsers}
            />
          )}

        </main>

      </div>

      {/* Global Action Modals */}
      {showCreateAssignmentModal && (
        <CreateAssignmentModal
          subjects={subjects}
          classes={classes}
          currentUser={currentUser}
          onClose={() => setShowCreateAssignmentModal(false)}
          onSubmit={handleCreateAssignment}
        />
      )}

      {showSubmitModalAssignment && (
        <SubmitAssignmentModal
          assignment={showSubmitModalAssignment}
          currentUser={currentUser}
          onClose={() => setShowSubmitModalAssignment(null)}
          onSubmit={handleSubmitAssignment}
        />
      )}

      {showCreateAttendanceModal && (
        <CreateAttendanceModal
          subjects={subjects}
          classes={classes}
          allStudents={(allUsers || []).filter(u => u.role === 'student')}
          currentUser={currentUser}
          onClose={() => setShowCreateAttendanceModal(false)}
          onSubmit={handleCreateAttendance}
        />
      )}

      {showCreateTestModal && (
        <CreateTestModal
          subjects={subjects}
          classes={classes}
          currentUser={currentUser}
          onClose={() => setShowCreateTestModal(false)}
          onSubmit={handleCreateTest}
        />
      )}

      {showCreateMaterialModal && (
        <CreateMaterialModal
          subjects={subjects}
          currentUser={currentUser}
          onClose={() => setShowCreateMaterialModal(false)}
          onSubmit={handleCreateMaterial}
        />
      )}

      {showCreateProjectModal && (
        <CreateProjectModal
          subjects={subjects}
          classes={classes}
          allStudents={(allUsers || []).filter(u => u.role === 'student')}
          currentUser={currentUser}
          onClose={() => setShowCreateProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

    </div>
  );
}
