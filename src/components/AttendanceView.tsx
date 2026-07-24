import React, { useState } from 'react';
import {
  User,
  AttendanceSession,
  AttendanceRecord,
  CourseClass,
  Subject
} from '../types';
import {
  CalendarCheck2,
  Plus,
  AlertTriangle,
  Check,
  X,
  Clock,
  UserX,
  UserCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface AttendanceViewProps {
  currentUser: User;
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  classes: CourseClass[];
  subjects: Subject[];
  allStudents: User[];
  onOpenCreateAttendance: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  attendanceSessions,
  attendanceRecords,
  classes,
  subjects,
  allStudents,
  onOpenCreateAttendance
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Filtered Sessions
  const filteredSessions = (attendanceSessions || []).filter(s => {
    return selectedSubjectFilter === 'all' || s.subjectId === selectedSubjectFilter;
  });

  // Calculate Student Attendance
  const myRecords = (attendanceRecords || []).filter(r => r.studentId === currentUser.id);
  const totalMyClasses = myRecords.length;
  const attendedMyClasses = myRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const myAttendancePct = totalMyClasses > 0 ? Math.round((attendedMyClasses / totalMyClasses) * 100) : 100;

  // Subject-wise Attendance Breakdown for Student
  const subjectBreakdown = (subjects || []).map(sub => {
    const subSessions = (attendanceSessions || []).filter(s => s.subjectId === sub.id);
    const subSessionIds = subSessions.map(s => s.id);
    const subRecords = myRecords.filter(r => subSessionIds.includes(r.sessionId));
    const subTotal = subRecords.length;
    const subAttended = subRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const subPct = subTotal > 0 ? Math.round((subAttended / subTotal) * 100) : 100;

    return {
      subject: sub,
      total: subTotal,
      attended: subAttended,
      percentage: subPct
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-teal-600" /> Attendance Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            VTU 75% minimum mandatory attendance tracking system
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            onClick={onOpenCreateAttendance}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Record Class Attendance
          </button>
        )}
      </div>

      {/* Student View Summary */}
      {currentUser.role === 'student' && (
        <div className="space-y-6">
          
          {/* Gauge Card */}
          <div className={`p-6 rounded-3xl border bg-white shadow-xs ${
            myAttendancePct < 75 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance Score</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className={`text-4xl font-black ${myAttendancePct < 75 ? 'text-rose-600' : 'text-teal-700'}`}>
                    {totalMyClasses > 0 ? `${myAttendancePct}%` : '100%'}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    ({attendedMyClasses} present out of {totalMyClasses} total classes)
                  </span>
                </div>
              </div>

              {myAttendancePct < 75 ? (
                <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                  <div>
                    <div>Attendance Below Mandatory 75%!</div>
                    <div className="text-[11px] font-normal text-rose-700">Attend upcoming sessions to become exam eligible.</div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-teal-600" />
                  <div>
                    <div>Mandatory Threshold Satisfied</div>
                    <div className="text-[11px] font-normal text-teal-700">Your attendance is above the required 75% limit.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Progress Bar */}
            <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${myAttendancePct < 75 ? 'bg-rose-500' : 'bg-teal-500'}`}
                style={{ width: `${Math.min(myAttendancePct, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Subject-Wise Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Subject-wise Attendance Breakdown</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject Code & Name</th>
                    <th className="py-3 px-4 text-center">Attended / Total</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-right">VTU Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {subjectBreakdown.map(item => (
                    <tr key={item.subject.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.subject.code}: {item.subject.name}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        {item.attended} / {item.total}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-black ${item.percentage < 75 ? 'text-rose-600' : 'text-teal-700'}`}>
                          {item.total > 0 ? `${item.percentage}%` : '100%'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          item.percentage < 75 ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {item.percentage < 75 ? 'Low Attendance' : 'Eligible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Class Attendance Sessions Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Recorded Attendance Sessions</h2>
          
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.code}: {sub.name}</option>
            ))}
          </select>
        </div>

        {filteredSessions.length === 0 ? (
          <EmptyState
            title="No attendance records found"
            description="No recorded attendance sessions exist in Supabase database."
            actionText={currentUser.role === 'teacher' ? "Record Session" : undefined}
            onAction={currentUser.role === 'teacher' ? onOpenCreateAttendance : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(sess => (
              <div key={sess.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800">
                      {sess.subjectName}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{sess.className}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Topic: {sess.topicCovered}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {sess.date}</span>
                    <span>By {sess.teacherName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-bold">
                    {sess.presentCount} / {sess.totalStudents} Present
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {Math.round((sess.presentCount / sess.totalStudents) * 100)}% Class Turnout
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
