import React, { useState, useEffect } from 'react';
import {
  User,
  Assignment,
  Submission,
  AttendanceRecord,
  AttendanceSession,
  Test,
  TestResult,
  StudyMaterial,
  Project,
  AIProgressReport
} from '../types';
import {
  CalendarCheck2,
  FileText,
  Award,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  FolderGit2,
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { api } from '../services/api';
import { EmptyState } from './EmptyState';

interface StudentDashboardProps {
  currentUser: User;
  assignments: Assignment[];
  submissions: Submission[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  tests: Test[];
  testResults: TestResult[];
  materials: StudyMaterial[];
  projects: Project[];
  setActiveTab: (tab: string) => void;
  onOpenSubmitModal: (assignment: Assignment) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  assignments,
  submissions,
  attendanceSessions,
  attendanceRecords,
  tests,
  testResults,
  materials,
  projects,
  setActiveTab,
  onOpenSubmitModal
}) => {
  const [aiReport, setAiReport] = useState<AIProgressReport | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Calculate Attendance Percentage
  const myRecords = (attendanceRecords || []).filter(r => r.studentId === currentUser.id);
  const totalClasses = myRecords.length;
  const attendedClasses = myRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

  // Test Results & Average Marks
  const myResults = (testResults || []).filter(r => r.studentId === currentUser.id);
  const averageMarks = myResults.length > 0 ? Math.round(myResults.reduce((sum, r) => sum + r.obtainedMarks, 0) / myResults.length) : 85;

  // Pending Assignments
  const mySubmissions = (submissions || []).filter(s => s.studentId === currentUser.id);
  const pendingAssignments = (assignments || []).filter(a => !mySubmissions.some(s => s.assignmentId === a.id));

  // Recent Reviewed Submissions
  const reviewedSubmissions = mySubmissions.filter(s => s.status === 'reviewed');

  // Load AI Progress Report on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingAi(true);
    api.getAIProgressAnalysis(currentUser.name, attendancePercentage, averageMarks, pendingAssignments.length)
      .then(report => {
        if (isMounted) setAiReport(report);
      })
      .catch(err => console.error('Failed to load AI progress report:', err))
      .finally(() => {
        if (isMounted) setLoadingAi(false);
      });
    return () => { isMounted = false; };
  }, [currentUser.id, attendancePercentage, averageMarks, pendingAssignments.length]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-teal-500/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome back, {currentUser.name}!
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {currentUser.usn || '1BG22CS084'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {currentUser.className || '5th Sem CSE'} • {currentUser.departmentName || 'Computer Science & Engineering'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai_assistant')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-lg active:scale-95"
          >
            <Sparkles className="w-4 h-4" /> Ask AI Learning Assistant
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance KPI */}
        <div className={`p-5 rounded-2xl border bg-white shadow-xs transition-all ${
          attendancePercentage < 75 ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              attendancePercentage < 75 ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-700'
            }`}>
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${attendancePercentage < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
              {totalClasses > 0 ? `${attendancePercentage}%` : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-500">
              ({attendedClasses}/{totalClasses} classes)
            </span>
          </div>
          <div className="mt-3">
            {attendancePercentage < 75 ? (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> VTU 75% Threshold Alert
              </div>
            ) : (
              <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing (&gt; 75%)
              </div>
            )}
          </div>
        </div>

        {/* Pending Assignments KPI */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Assignments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {pendingAssignments.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Next due in {pendingAssignments.length > 0 ? '3 days' : 'No pending tasks'}
          </p>
        </div>

        {/* Recent Marks Score KPI */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reviewed Marks</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {reviewedSubmissions.length} graded
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Latest: {reviewedSubmissions[0] ? `${reviewedSubmissions[0].obtainedMarks} marks awarded` : 'No reviews yet'}
          </p>
        </div>

        {/* Active Projects KPI */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {projects.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Group / Individual Capstone
          </p>
        </div>

      </div>

      {/* Main Content Layout: Left Grid & Right AI Advisor Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Assignments Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Pending Assignments
                </h2>
                <p className="text-xs text-slate-500">Submit completed tasks before due deadline</p>
              </div>
              <button
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingAssignments.length === 0 ? (
              <EmptyState
                title="No Pending Assignments!"
                description="You have submitted all active assignments for your enrolled subjects. Great job!"
              />
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map(asgn => {
                  const isPast = new Date() > new Date(asgn.dueDate);
                  return (
                    <div key={asgn.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800">
                            {asgn.subjectName}
                          </span>
                          <span className="text-xs text-slate-500">Max Marks: {asgn.maxMarks}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{asgn.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-1">{asgn.description}</p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {new Date(asgn.dueDate).toLocaleDateString()}
                          </span>
                          {isPast && (
                            <span className="px-2 py-0.2 rounded font-bold bg-rose-100 text-rose-700 text-[10px]">
                              Late Submission
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenSubmitModal(asgn)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-900 text-white hover:bg-indigo-800 transition-all shrink-0 shadow-xs active:scale-95"
                      >
                        Submit Assignment
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Reviewed Submissions & Teacher Feedback */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600" /> Graded Marks & Teacher Reviews
                </h2>
                <p className="text-xs text-slate-500">Feedback and scored marks from professors</p>
              </div>
            </div>

            {reviewedSubmissions.length === 0 ? (
              <EmptyState
                title="No Reviewed Submissions Yet"
                description="Your submitted assignments will appear here once reviewed by your subject professors."
              />
            ) : (
              <div className="space-y-3">
                {reviewedSubmissions.map(sub => {
                  const asgn = assignments.find(a => a.id === sub.assignmentId);
                  return (
                    <div key={sub.id} className="p-4 rounded-xl border border-teal-100 bg-teal-50/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-800">{asgn?.subjectName || 'Subject'}</span>
                        <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-teal-600 text-white shadow-xs">
                          {sub.obtainedMarks} / {asgn?.maxMarks || 20} Marks
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{asgn?.title}</h4>
                      {sub.teacherFeedback && (
                        <div className="p-2.5 rounded-lg bg-white border border-teal-200/80 text-xs text-slate-700 italic">
                          "{sub.teacherFeedback}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Academic Progress Advisor & Upcoming Tests */}
        <div className="space-y-6">
          
          {/* AI Progress Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold">BNM AI Academic Report</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded-full">
                Live Insights
              </span>
            </div>

            {loadingAi ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                Analyzing attendance, submissions & test scores...
              </div>
            ) : aiReport ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 leading-relaxed">
                  {aiReport.aiSummary}
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-teal-300 text-[11px] uppercase tracking-wider">
                    Recommended Actions
                  </span>
                  {((aiReport && aiReport.recommendations) || []).map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setActiveTab('ai_assistant')}
              className="w-full py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all text-center"
            >
              Consult AI Tutor
            </button>
          </div>

          {/* Upcoming Tests Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Scheduled Exams & Tests
              </h3>
            </div>

            {(tests || []).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No scheduled exams currently.</div>
            ) : (
              <div className="space-y-3">
                {(tests || []).map(tst => (
                  <div key={tst.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-800">{tst.subjectName}</span>
                      <span className="text-slate-500 font-medium">{tst.testDate}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{tst.title}</div>
                    <div className="text-[11px] text-slate-500">Max Marks: {tst.maxMarks} • {tst.durationMinutes} mins</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
