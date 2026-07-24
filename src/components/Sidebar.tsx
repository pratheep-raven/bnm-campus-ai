import React from 'react';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck2,
  Award,
  BookOpen,
  FolderGit2,
  Sparkles,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  unreadNotificationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  unreadNotificationsCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'marks', label: 'Tests & Marks', icon: Award },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'ai_assistant', label: 'BNM AI Assistant', icon: Sparkles, highlight: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
  ];

  if (userRole === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: ShieldCheck, highlight: false });
  }

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        
        {/* Role Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xs">
          <div className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Active Mode</div>
          <div className="text-sm font-bold capitalize flex items-center justify-between mt-0.5">
            <span>{userRole} Workspace</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {userRole === 'student' ? 'Access assignments, attendance & AI learning' :
             userRole === 'teacher' ? 'Manage classes, assignments, tests & review submissions' :
             'Manage campus database, classes & faculty'}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : item.highlight
                    ? 'text-teal-700 hover:bg-teal-50 border border-teal-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : item.highlight ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                ) : item.highlight ? (
                  <Sparkles className="w-3 h-3 text-teal-500" />
                ) : null}
              </button>
            );
          })}
        </nav>

      </div>

      {/* BNM AI Status Widget */}
      <div className="mt-8 p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-teal-900">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold">BNM Multi-Agent AI</span>
        </div>
        <p className="text-[11px] text-teal-800 leading-relaxed">
          Ask questions on Automata, DBMS, Networks, or run academic progress analysis anytime.
        </p>
        <button
          onClick={() => setActiveTab('ai_assistant')}
          className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-teal-700 text-white text-[11px] font-semibold hover:bg-teal-800 transition-all shadow-xs"
        >
          Open AI Assistant
        </button>
      </div>
    </aside>
  );
};
