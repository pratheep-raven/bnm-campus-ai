import React, { useState } from 'react';
import {
  User,
  Test,
  TestResult,
  Subject,
  CourseClass
} from '../types';
import {
  Award,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface MarksViewProps {
  currentUser: User;
  tests: Test[];
  testResults: TestResult[];
  subjects: Subject[];
  classes: CourseClass[];
  allStudents: User[];
  onOpenCreateTest: () => void;
  onRecordTestResults: (testId: string, results: { studentId: string; studentName: string; studentUsn: string; obtainedMarks: number; remarks?: string }[]) => Promise<void>;
}

export const MarksView: React.FC<MarksViewProps> = ({
  currentUser,
  tests,
  testResults,
  subjects,
  classes,
  allStudents,
  onOpenCreateTest,
  onRecordTestResults
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [marksTable, setMarksTable] = useState<{ [studentId: string]: { marks: number; remarks: string } }>({});
  const [savingResults, setSavingResults] = useState(false);

  const activeTest = (tests || []).find(t => t.id === selectedTestId);

  const handleSelectTestForGrading = (tst: Test) => {
    setSelectedTestId(tst.id);
    const existing = (testResults || []).filter(r => r.testId === tst.id);
    const initialMap: { [id: string]: { marks: number; remarks: string } } = {};
    (allStudents || []).forEach(s => {
      const match = existing.find(e => e.studentId === s.id);
      initialMap[s.id] = {
        marks: match ? match.obtainedMarks : 0,
        remarks: match ? match.remarks || '' : ''
      };
    });
    setMarksTable(initialMap);
  };

  const handleSaveMarks = async () => {
    if (!selectedTestId || !activeTest) return;
    setSavingResults(true);
    try {
      const payload = (allStudents || []).map(s => ({
        studentId: s.id,
        studentName: s.name,
        studentUsn: s.usn || '1BG22CS000',
        obtainedMarks: marksTable[s.id]?.marks || 0,
        remarks: marksTable[s.id]?.remarks || ''
      }));

      // Validate max marks
      const invalid = payload.find(p => p.obtainedMarks > activeTest.maxMarks);
      if (invalid) {
        alert(`Marks for ${invalid.studentName} cannot exceed maximum marks (${activeTest.maxMarks}).`);
        setSavingResults(false);
        return;
      }

      await onRecordTestResults(selectedTestId, payload);
      alert('Test marks recorded and published successfully!');
      setSelectedTestId(null);
    } catch (err: any) {
      alert(err.message || 'Error saving marks');
    } finally {
      setSavingResults(false);
    }
  };

  // Student test results
  const myTestResults = (testResults || []).filter(r => r.studentId === currentUser.id);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> Tests & Internal Assessment Marks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            VTU Internal Assessment (IA) exams, midterm tests & scorecards
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            onClick={onOpenCreateTest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900 text-white font-bold text-xs hover:bg-indigo-800 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule Exam / Test
          </button>
        )}
      </div>

      {/* Student View: My Exam Performance Report Card */}
      {currentUser.role === 'student' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" /> My Internal Assessment Marks Card
          </h2>

          {myTestResults.length === 0 ? (
            <EmptyState
              title="No marks published"
              description="Your test marks will appear here once faculty publishes exam results in Supabase."
            />
          ) : (
            <div className="space-y-3">
              {myTestResults.map(res => {
                const tst = tests.find(t => t.id === res.testId);
                const pct = tst ? Math.round((res.obtainedMarks / tst.maxMarks) * 100) : 0;
                return (
                  <div key={res.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800 uppercase">
                        {tst?.subjectName || 'Subject'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{tst?.title}</h3>
                      {res.remarks && (
                        <p className="text-xs text-slate-600 italic">"{res.remarks}"</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-indigo-900">
                        {res.obtainedMarks} / {tst?.maxMarks || 50} Marks
                      </div>
                      <div className="text-xs font-bold text-teal-600 mt-0.5">
                        {pct}% Score
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tests Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Scheduled Exams & Internal Tests</h2>

        {tests.length === 0 ? (
          <EmptyState
            title="No Scheduled Exams"
            description="No exams or internal tests have been created yet."
            actionText={currentUser.role === 'teacher' ? "Schedule Test" : undefined}
            onAction={currentUser.role === 'teacher' ? onOpenCreateTest : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(tests || []).map(tst => (
              <div key={tst.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800">
                      {tst.subjectName}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      Max: {tst.maxMarks} Marks
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{tst.title}</h3>
                  <p className="text-xs text-slate-600">{tst.syllabusCovered}</p>

                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {tst.testDate}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tst.durationMinutes} Mins</span>
                  </div>
                </div>

                {currentUser.role === 'teacher' && (
                  <button
                    onClick={() => handleSelectTestForGrading(tst)}
                    className="w-full py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                  >
                    Enter / Edit Test Marks
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grade Entry Table Drawer for Teachers */}
      {selectedTestId && activeTest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Test Marks: {activeTest.title}</h3>
                <p className="text-xs text-slate-500">{activeTest.subjectName} • Max Marks: {activeTest.maxMarks}</p>
              </div>
              <button onClick={() => setSelectedTestId(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {(allStudents || []).map(student => (
                <div key={student.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-[10px] text-slate-500">{student.usn}</div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Marks (Out of {activeTest.maxMarks})</span>
                      <input
                        type="number"
                        max={activeTest.maxMarks}
                        value={marksTable[student.id]?.marks || 0}
                        onChange={(e) => setMarksTable({
                          ...marksTable,
                          [student.id]: {
                            ...marksTable[student.id],
                            marks: Number(e.target.value)
                          }
                        })}
                        className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="flex-1 sm:w-48">
                      <span className="text-[10px] text-slate-500 block font-semibold">Teacher Remarks</span>
                      <input
                        type="text"
                        placeholder="Remarks..."
                        value={marksTable[student.id]?.remarks || ''}
                        onChange={(e) => setMarksTable({
                          ...marksTable,
                          [student.id]: {
                            ...marksTable[student.id],
                            remarks: e.target.value
                          }
                        })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTestId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMarks}
                disabled={savingResults}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-md active:scale-95 transition-all"
              >
                Save & Publish Test Results
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
