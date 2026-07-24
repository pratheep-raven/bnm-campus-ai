import React, { useState } from 'react';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCheck,
  FileText,
  CalendarCheck2,
  Award,
  BookOpen,
  FolderGit2
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkNotificationsRead
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const safeNotifs = notifications || [];
  const filtered = safeNotifs.filter(n => filter === 'all' || !n.isRead);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'attendance': return <CalendarCheck2 className="w-4 h-4 text-teal-600" />;
      case 'marks': return <Award className="w-4 h-4 text-purple-600" />;
      case 'material': return <BookOpen className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" /> Campus Real-Time Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time alerts for assignments, attendance, marks & campus updates
          </p>
        </div>

        {safeNotifs.some(n => !n.isRead) && (
          <button
            onClick={onMarkNotificationsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-teal-600" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Notifications ({safeNotifs.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread Only ({safeNotifs.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description={filter === 'unread' ? "You have read all current notifications!" : "No recent notifications logged."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                notif.isRead
                  ? 'bg-white border-slate-200/80 opacity-80'
                  : 'bg-teal-50/30 border-teal-200 shadow-xs'
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs mt-0.5 shrink-0">
                {getNotifIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
