import React, { useState } from 'react';
import {
  User,
  Assignment,
  Submission,
  AttendanceSession,
  Test,
  StudyMaterial,
  Project,
  CourseClass,
  Subject
} from '../types';
import {
  Plus,
  Users,
  FileCheck2,
  CalendarCheck2,
  BookOpen,
  FolderGit2,
  Award,
  CheckCircle,
  Clock,
  Send,
  X
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface TeacherDashboardProps {
  currentUser: User;
  classes: CourseClass[];
  subjects: Subject[];
  assignments: Assignment[];
  submissions: Submission[];
  attendanceSessions: AttendanceSession[];
  tests: Test[];
  materials: StudyMaterial[];
  projects: Project[];
  allStudents: User[];
  setActiveTab: (tab: string) => void;
  onOpenCreateAssignment: () => void;
  onOpenCreateAttendance: () => void;
  onOpenCreateTest: () => void;
  onOpenCreateMaterial: () => void;
  onOpenCreateProject: () => void;
  onReviewSubmission: (submissionId: string, marks: number, feedback: string) => Promise<void>;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  classes,
  subjects,
  assignments,
  submissions,
  attendanceSessions,
  tests,
  materials,
  projects,
  allStudents,
  setActiveTab,
  onOpenCreateAssignment,
  onOpenCreateAttendance,
  onOpenCreateTest,
  onOpenCreateMaterial,
  onOpenCreateProject,
  onReviewSubmission
}) => {
  const [selectedSubm, setSelectedSubm] = useState<Submission | null>(null);
  const [marksInput, setMarksInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Submissions pending grading
  const pendingSubmissions = (submissions || []).filter(s => s.status === 'submitted' || s.status === 'late');

  const handleOpenReview = (subm: Submission) => {
    setSelectedSubm(subm);
    setMarksInput(subm.obtainedMarks || 0);
    setFeedbackInput(subm.teacherFeedback || '');
  };

  const handleSaveReview = async () => {
    if (!selectedSubm) return;
    setSubmittingReview(true);
    try {
      await onReviewSubmission(selectedSubm.id, marksInput, feedbackInput);
      setSelectedSubm(null);
    } catch (err: any) {
      alert(err.message || 'Error reviewing submission');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Teacher Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-500/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {currentUser.facultyId || 'BNM-FAC-019'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser.designation || 'Associate Professor'} • {currentUser.departmentName || 'Computer Science'}
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateAssignment}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Assignment
          </button>
          <button
            onClick={onOpenCreateAttendance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Attendance
          </button>
          <button
            onClick={onOpenCreateTest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Exam/Test
          </button>
        </div>
      </div>

      {/* Teacher Stats KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Roster</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{allStudents.length} Students</div>
          <p className="text-[11px] text-slate-500 mt-2">Enrolled across 5th Sem CSE-A/B</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingSubmissions.length} Submissions</div>
          <p className="text-[11px] text-slate-500 mt-2">Awaiting grade & review notes</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Logs</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{attendanceSessions.length} Sessions</div>
          <p className="text-[11px] text-slate-500 mt-2">Recorded & synchronized</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Published Notes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{materials.length} Materials</div>
          <p className="text-[11px] text-slate-500 mt-2">PDF & PPT lecture notes</p>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Submissions Review Queue */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-purple-600" /> Student Submissions Awaiting Review
                </h2>
                <p className="text-xs text-slate-500">Grade student work and write constructive feedback</p>
              </div>
            </div>

            {pendingSubmissions.length === 0 ? (
              <EmptyState
                title="No Pending Submissions to Grade"
                description="All submitted student assignments have been reviewed. When students upload new work, it will show here."
              />
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.map(sub => {
                  const asgn = assignments.find(a => a.id === sub.assignmentId);
                  return (
                    <div key={sub.id} className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">{sub.studentName}</span>
                          <span className="text-slate-500 font-medium">({sub.studentUsn})</span>
                          {sub.status === 'late' && (
                            <span className="px-2 py-0.2 font-bold text-[10px] rounded bg-rose-100 text-rose-700">
                              Late
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-purple-900">{asgn?.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 bg-white p-2 rounded border border-slate-200">
                          {sub.submissionText}
                        </p>
                        {sub.attachmentUrl && (
                          <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-purple-600 hover:underline inline-block">
                            📎 View Attachment Link
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-900 text-white hover:bg-purple-800 transition-all shrink-0 shadow-xs active:scale-95"
                      >
                        Review & Grade
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Attendance Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-teal-600" /> Recent Attendance Logs
                </h2>
                <p className="text-xs text-slate-500">Class sessions recorded</p>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                Open Register
              </button>
            </div>

            {attendanceSessions.length === 0 ? (
              <EmptyState
                title="No Attendance Logs Found"
                description="Log daily class attendance for your assigned subjects."
                actionText="Record Attendance Now"
                onAction={onOpenCreateAttendance}
              />
            ) : (
              <div className="space-y-3">
                {(attendanceSessions || []).slice(0, 4).map(sess => (
                  <div key={sess.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{sess.subjectName} ({sess.className})</div>
                      <div className="text-[11px] text-slate-500">Topic: {sess.topicCovered}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-teal-700">{sess.presentCount} / {sess.totalStudents} Present</div>
                      <div className="text-[10px] text-slate-400">{sess.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Handled Subjects & Quick Actions */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" /> Handled Subjects
            </h3>
            <div className="space-y-2">
              {(subjects || []).map(sub => (
                <div key={sub.id} className="p-3 rounded-xl border border-purple-100 bg-purple-50/30 text-xs">
                  <div className="font-bold text-purple-900">{sub.code}: {sub.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">5th Semester • {sub.credits} Credits</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              ⚡ Teacher Quick Tools
            </h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={onOpenCreateAssignment}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-all flex items-center justify-between"
              >
                <span>➕ Create Assignment</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={onOpenCreateAttendance}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-all flex items-center justify-between"
              >
                <span>📋 Mark Attendance Session</span>
                <CalendarCheck2 className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={onOpenCreateMaterial}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-all flex items-center justify-between"
              >
                <span>📚 Upload Notes / PDF</span>
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={onOpenCreateProject}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-all flex items-center justify-between"
              >
                <span>🚀 Assign Project Task</span>
                <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Submission Review Modal Drawer */}
      {selectedSubm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review Student Submission</h3>
                <p className="text-xs text-slate-500">{selectedSubm.studentName} ({selectedSubm.studentUsn})</p>
              </div>
              <button onClick={() => setSelectedSubm(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Answer Text:</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed max-h-40 overflow-y-auto">
                  {selectedSubm.submissionText}
                </div>
              </div>

              {selectedSubm.attachmentUrl && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attachment:</label>
                  <a href={selectedSubm.attachmentUrl} target="_blank" rel="noreferrer" className="text-purple-600 font-semibold hover:underline">
                    {selectedSubm.attachmentUrl}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Award Marks:</label>
                  <input
                    type="number"
                    value={marksInput}
                    onChange={(e) => setMarksInput(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status:</label>
                  <div className="px-3 py-2 bg-slate-100 rounded-xl font-bold text-slate-700 capitalize">
                    {selectedSubm.status}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teacher Feedback Notes:</label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="E.g., Excellent functional dependency proof. Clear diagram!"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSubm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                disabled={submittingReview}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-900 hover:bg-purple-800 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Save & Send Marks
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
