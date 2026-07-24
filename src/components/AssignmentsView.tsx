import React, { useState } from 'react';
import {
  User,
  Assignment,
  Submission,
  Subject,
  CourseClass
} from '../types';
import {
  FileText,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Download
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface AssignmentsViewProps {
  currentUser: User;
  assignments: Assignment[];
  submissions: Submission[];
  subjects: Subject[];
  classes: CourseClass[];
  onOpenCreateAssignment: () => void;
  onOpenSubmitModal: (assignment: Assignment) => void;
  onOpenReviewModal: (submission: Submission) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  currentUser,
  assignments,
  submissions,
  subjects,
  classes,
  onOpenCreateAssignment,
  onOpenSubmitModal,
  onOpenReviewModal
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAssignments = (assignments || []).filter(asgn => {
    const matchesSubject = selectedSubjectFilter === 'all' || asgn.subjectId === selectedSubjectFilter;
    const matchesSearch = asgn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asgn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asgn.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Academic Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View course assignments, download attachment specs, and manage submissions
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            onClick={onOpenCreateAssignment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900 text-white font-bold text-xs hover:bg-indigo-800 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Post New Assignment
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignment title, subject..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Subject:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Subjects</option>
            {(subjects || []).map(sub => (
              <option key={sub.id} value={sub.id}>{sub.code}: {sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments available"
          description={searchQuery || selectedSubjectFilter !== 'all' ? "No assignments match your search filter." : "There are no posted assignments currently in Supabase database."}
          actionText={currentUser.role === 'teacher' ? "Post Assignment" : undefined}
          onAction={currentUser.role === 'teacher' ? onOpenCreateAssignment : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map(asgn => {
            const isPastDue = new Date() > new Date(asgn.dueDate);
            const studentSubm = (submissions || []).find(s => s.assignmentId === asgn.id && s.studentId === currentUser.id);

            return (
              <div key={asgn.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4">
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                      {asgn.subjectName}
                    </span>
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      Max: {asgn.maxMarks} Marks
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{asgn.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{asgn.description}</p>

                  {asgn.attachmentUrl && (
                    <div className="pt-1">
                      <a
                        href={asgn.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline bg-indigo-50/60 px-3 py-1.5 rounded-lg border border-indigo-100"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Assignment File
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Due: {new Date(asgn.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">By {asgn.teacherName}</div>
                  </div>

                  {currentUser.role === 'student' ? (
                    studentSubm ? (
                      <div className="text-right">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${
                          studentSubm.status === 'reviewed' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {studentSubm.status === 'reviewed' ? `${studentSubm.obtainedMarks}/${asgn.maxMarks} Marks` : 'Submitted'}
                        </span>
                        {studentSubm.teacherFeedback && (
                          <div className="text-[10px] text-teal-700 mt-1 max-w-[140px] truncate">
                            "{studentSubm.teacherFeedback}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenSubmitModal(asgn)}
                        className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                      >
                        Submit Answer
                      </button>
                    )
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        {(submissions || []).filter(s => s.assignmentId === asgn.id).length} Submissions
                      </span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
