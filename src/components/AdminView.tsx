import React from 'react';
import {
  Department,
  CourseClass,
  Subject,
  User
} from '../types';
import {
  ShieldCheck,
  Building2,
  Users,
  Database,
  CheckCircle2
} from 'lucide-react';

interface AdminViewProps {
  departments: Department[];
  classes: CourseClass[];
  subjects: Subject[];
  allUsers: User[];
}

export const AdminView: React.FC<AdminViewProps> = ({
  departments,
  classes,
  subjects,
  allUsers
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" /> BNM Campus Admin Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage departments, classes, subject catalogues, and faculty roster connected to Supabase
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supabase Realtime Active
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Departments</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{(departments || []).length}</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Classes / Sections</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{(classes || []).length}</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Subjects Listed</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{(subjects || []).length}</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Registered Users</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{(allUsers || []).length}</div>
        </div>
      </div>

      {/* Departments & HODs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-600" /> Academic Departments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(departments || []).map(dept => (
            <div key={dept.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{dept.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                  {dept.code}
                </span>
              </div>
              <div className="text-xs text-slate-600">HOD: <span className="font-bold">{dept.headOfDepartment || 'Unassigned'}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" /> Registered Campus Users
        </h2>

        <div className="space-y-2">
          {(allUsers || []).map(usr => (
            <div key={usr.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                  {usr.name ? usr.name.slice(0, 2) : 'US'}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{usr.name}</div>
                  <div className="text-[10px] text-slate-500">{usr.email} • {usr.usn || usr.departmentName || 'Campus User'}</div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] ${
                usr.role === 'student' ? 'bg-blue-100 text-blue-800' :
                usr.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {usr.role}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
