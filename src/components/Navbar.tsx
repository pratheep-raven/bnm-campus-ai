import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import {
  GraduationCap,
  Bell,
  Search,
  UserCheck,
  ChevronDown,
  Sparkles,
  RefreshCw,
  CheckCheck,
  LogOut,
  X
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onUserSwitch: (user: User) => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  onRefreshData: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onUserSwitch,
  notifications,
  onMarkNotificationsRead,
  onRefreshData,
  activeTab,
  setActiveTab,
  onSignOut
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const safeNotifs = notifications || [];
  const safeUsers = allUsers || [];
  const unreadCount = safeNotifs.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Campus Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  BNM Campus AI
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> VTU v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">BNM Institute of Technology</p>
            </div>
          </div>

          {/* Quick Global Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search assignments, subjects, notes, attendance..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Sync / Refresh Data Button */}
            <button
              onClick={onRefreshData}
              title="Refresh Data"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 relative transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifPopover && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-semibold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-500/20 text-teal-300 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkNotificationsRead}
                          className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark read
                        </button>
                      )}
                      <button onClick={() => setShowNotifPopover(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {safeNotifs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No recent notifications</div>
                    ) : (
                      safeNotifs.slice(0, 8).map(notif => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs transition-all ${notif.isRead ? 'bg-slate-900/60 opacity-75' : 'bg-slate-800/40 border-l-2 border-teal-500'}`}
                        >
                          <div className="font-semibold text-slate-200 mb-0.5">{notif.title}</div>
                          <div className="text-slate-400 leading-snug mb-1">{notif.message}</div>
                          <div className="text-[10px] text-slate-500">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 bg-slate-950 border-t border-slate-800 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifPopover(false);
                      }}
                      className="text-xs text-teal-400 font-medium hover:underline"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher & User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all text-left"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-teal-500/50"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    {currentUser.name}
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                      currentUser.role === 'student' ? 'bg-blue-500/20 text-blue-300' :
                      currentUser.role === 'teacher' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{currentUser.usn || currentUser.facultyId || currentUser.email}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Switcher Modal Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>Switch Campus User Role</span>
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="py-1 space-y-1">
                    {safeUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onUserSwitch(user);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-all ${
                          user.id === currentUser.id
                            ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-white">{user.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="capitalize">{user.role}</span> • <span>{user.usn || user.facultyId || user.departmentName}</span>
                          </div>
                        </div>
                        {user.id === currentUser.id && (
                          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                        )}
                      </button>
                    ))}
                  </div>

                  {onSignOut && (
                    <div className="pt-2 mt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/20 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out of Supabase
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
