import React, { useState } from 'react';
import {
  Assignment,
  Submission,
  AttendanceSession,
  Test,
  StudyMaterial,
  Project,
  Subject,
  CourseClass,
  User
} from '../types';
import { X, Send, Plus, Upload, Check } from 'lucide-react';

// -------------------------------------------------------------
// CREATE ASSIGNMENT MODAL
// -------------------------------------------------------------
interface CreateAssignmentModalProps {
  subjects: Subject[];
  classes: CourseClass[];
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: Partial<Assignment>) => Promise<void>;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  subjects,
  classes,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(20);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return alert('Please enter Title and Due Date');
    setLoading(true);
    const sub = subjects.find(s => s.id === subjectId);
    const cls = classes.find(c => c.id === classId);

    try {
      await onSubmit({
        title,
        description,
        subjectId,
        subjectName: sub ? `${sub.code}: ${sub.name}` : 'Subject',
        classId,
        className: cls ? cls.name : 'Class',
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        dueDate,
        maxMarks,
        attachmentUrl
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Post New Assignment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., DFA State Minimization & Pumping Lemma"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}: {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Class *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description / Instructions</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Attachment / PDF Link (Optional)</label>
            <input
              type="text"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://bnmit.ac.in/syllabus/spec.pdf"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-md active:scale-95 transition-all"
            >
              Post Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// SUBMIT ASSIGNMENT MODAL (STUDENT)
// -------------------------------------------------------------
interface SubmitAssignmentModalProps {
  assignment: Assignment;
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: Partial<Submission>) => Promise<void>;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({
  assignment,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim()) return alert('Please enter your submission text/solution.');
    setLoading(true);

    try {
      await onSubmit({
        assignmentId: assignment.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentUsn: currentUser.usn || '1BG22CS084',
        submissionText,
        attachmentUrl
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error submitting assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submit Assignment</h3>
            <p className="text-xs text-slate-500">{assignment.title} ({assignment.subjectName})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Your Solution / Answer Text *</label>
            <textarea
              required
              rows={5}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Write your explanation, code solution, or summary here..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">GitHub / Google Drive / PDF Link</label>
            <input
              type="text"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://github.com/my-repo or drive link"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Work
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CREATE ATTENDANCE SESSION MODAL
// -------------------------------------------------------------
interface CreateAttendanceModalProps {
  subjects: Subject[];
  classes: CourseClass[];
  allStudents: User[];
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const CreateAttendanceModal: React.FC<CreateAttendanceModalProps> = ({
  subjects,
  classes,
  allStudents,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicCovered, setTopicCovered] = useState('');
  
  // Student statuses map: { studentId: 'present' | 'absent' | 'late' | 'excused' }
  const [statusMap, setStatusMap] = useState<{ [id: string]: string }>(() => {
    const init: { [id: string]: string } = {};
    allStudents.forEach(s => init[s.id] = 'present');
    return init;
  });
  const [loading, setLoading] = useState(false);

  const handleMarkAllPresent = () => {
    const updated: { [id: string]: string } = {};
    allStudents.forEach(s => updated[s.id] = 'present');
    setStatusMap(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicCovered) return alert('Please enter Topic Covered');
    setLoading(true);

    const sub = subjects.find(s => s.id === subjectId);
    const cls = classes.find(c => c.id === classId);

    const records = allStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      studentUsn: s.usn || '1BG22CS000',
      status: statusMap[s.id] || 'present'
    }));

    try {
      await onSubmit({
        classId,
        className: cls ? cls.name : 'Class',
        subjectId,
        subjectName: sub ? `${sub.code}: ${sub.name}` : 'Subject',
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        date,
        topicCovered,
        records
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error recording attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Record Class Attendance Session</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-teal-500"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}: {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Class *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-teal-500"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Session Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Topic Covered *</label>
              <input
                type="text"
                required
                placeholder="E.g., Distance Vector Routing & BGP"
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Student Register Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Student Attendance Status</span>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                ✓ Mark All Present
              </button>
            </div>

            <div className="space-y-2">
              {allStudents.map(student => (
                <div key={student.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-[10px] text-slate-500">{student.usn}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    {['present', 'absent', 'late', 'excused'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusMap({ ...statusMap, [student.id]: st })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                          statusMap[student.id] === st
                            ? st === 'present' ? 'bg-teal-600 text-white' :
                              st === 'absent' ? 'bg-rose-600 text-white' :
                              st === 'late' ? 'bg-amber-600 text-white' : 'bg-purple-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-md active:scale-95 transition-all"
            >
              Save Attendance Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CREATE TEST MODAL
// -------------------------------------------------------------
interface CreateTestModalProps {
  subjects: Subject[];
  classes: CourseClass[];
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: Partial<Test>) => Promise<void>;
}

export const CreateTestModal: React.FC<CreateTestModalProps> = ({
  subjects,
  classes,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [testDate, setTestDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(50);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [syllabusCovered, setSyllabusCovered] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !testDate) return alert('Please enter Title and Test Date');
    setLoading(true);

    const sub = subjects.find(s => s.id === subjectId);
    const cls = classes.find(c => c.id === classId);

    try {
      await onSubmit({
        title,
        subjectId,
        subjectName: sub ? `${sub.code}: ${sub.name}` : 'Subject',
        classId,
        className: cls ? cls.name : 'Class',
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        testDate,
        maxMarks,
        durationMinutes,
        syllabusCovered
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error scheduling test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Schedule Exam / Internal Test</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Test Title *</label>
            <input
              type="text"
              required
              placeholder="E.g., Internal Assessment Test 1 (IA-1)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}: {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Class *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Test Date *</label>
              <input
                type="date"
                required
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Duration (Mins)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Syllabus Covered</label>
            <input
              type="text"
              placeholder="E.g., Module 1 & 2: Regular Expressions and Finite Automata"
              value={syllabusCovered}
              onChange={(e) => setSyllabusCovered(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-md active:scale-95 transition-all"
            >
              Schedule Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CREATE MATERIAL MODAL
// -------------------------------------------------------------
interface CreateMaterialModalProps {
  subjects: Subject[];
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: Partial<StudyMaterial>) => Promise<void>;
}

export const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({
  subjects,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [unitNumber, setUnitNumber] = useState(1);
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'doc' | 'slides' | 'link'>('pdf');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) return alert('Please enter Title and File URL');
    setLoading(true);

    const sub = subjects.find(s => s.id === subjectId);

    try {
      await onSubmit({
        title,
        description,
        subjectId,
        subjectName: sub ? `${sub.code}: ${sub.name}` : 'Subject',
        unitNumber,
        fileUrl,
        fileType,
        uploadedBy: currentUser.id,
        teacherName: currentUser.name
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error uploading material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Upload Study Notes / PDF</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="E.g., Module 1 Lecture Slides & Solved Examples"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}: {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Unit Number</label>
              <select
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>Unit 1</option>
                <option value={2}>Unit 2</option>
                <option value={3}>Unit 3</option>
                <option value={4}>Unit 4</option>
                <option value={5}>Unit 5</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short notes summary..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">File Format</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pdf">PDF Document</option>
                <option value="slides">PPT Presentation</option>
                <option value="doc">Word DOC</option>
                <option value="link">External Web Link</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">File / Drive URL *</label>
              <input
                type="text"
                required
                placeholder="https://bnmit.ac.in/notes/unit1.pdf"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-md active:scale-95 transition-all"
            >
              Upload Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CREATE PROJECT MODAL
// -------------------------------------------------------------
interface CreateProjectModalProps {
  subjects: Subject[];
  classes: CourseClass[];
  allStudents: User[];
  currentUser: User;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => Promise<void>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  subjects,
  classes,
  allStudents,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [taskTitles, setTaskTitles] = useState<string[]>(['Task 1: Requirements', 'Task 2: Implementation']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('Please enter Project Title');
    setLoading(true);

    const sub = subjects.find(s => s.id === subjectId);
    const cls = classes.find(c => c.id === classId);

    const tasks = taskTitles.filter(t => t.trim()).map((t, i) => {
      const student = allStudents[i % allStudents.length];
      return {
        title: t,
        assignedStudentId: student ? student.id : '',
        assignedStudentName: student ? student.name : 'Student',
        status: 'todo',
        dueDate
      };
    });

    try {
      await onSubmit({
        title,
        description,
        subjectId,
        subjectName: sub ? `${sub.code}: ${sub.name}` : 'Subject',
        classId,
        className: cls ? cls.name : 'Class',
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        dueDate,
        assignedStudentIds: allStudents.map(s => s.id),
        repositoryUrl,
        tasks
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Create Academic Project</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Project Title *</label>
            <input
              type="text"
              required
              placeholder="E.g., BNM Campus Smart Bus Tracking"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}: {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Class *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project goals & objectives..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Final Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">GitHub Repository Link</label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-purple-900 hover:bg-purple-800 text-white shadow-md active:scale-95 transition-all"
            >
              Assign Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
