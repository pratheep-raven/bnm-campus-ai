import React from 'react';
import {
  User,
  Project,
  Subject,
  CourseClass
} from '../types';
import {
  FolderGit2,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  CheckSquare
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface ProjectsViewProps {
  currentUser: User;
  projects: Project[];
  subjects: Subject[];
  classes: CourseClass[];
  allStudents: User[];
  onOpenCreateProject: () => void;
  onUpdateTaskStatus: (projectId: string, taskId: string, status: 'todo' | 'in_progress' | 'completed') => Promise<void>;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  currentUser,
  projects,
  subjects,
  classes,
  allStudents,
  onOpenCreateProject,
  onUpdateTaskStatus
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-purple-600" /> Academic Projects & Capstones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Group project assignments, task milestone tracking & repository integration
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            onClick={onOpenCreateProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900 text-white font-bold text-xs hover:bg-purple-800 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Academic Project
          </button>
        )}
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <EmptyState
          title="No Academic Projects Found"
          description="No group or individual capstone projects currently assigned."
          actionText={currentUser.role === 'teacher' ? "Assign Project" : undefined}
          onAction={currentUser.role === 'teacher' ? onOpenCreateProject : undefined}
        />
      ) : (
        <div className="space-y-6">
          {(projects || []).map(proj => {
            const tasks = proj.tasks || [];
            const completedCount = tasks.filter(t => t.status === 'completed').length;
            const totalTasks = tasks.length;
            const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

            return (
              <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-800">
                        {proj.subjectName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{proj.className}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{proj.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                      {progressPct}% Progress ({completedCount}/{totalTasks} Tasks)
                    </div>
                    {proj.repositoryUrl && (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> GitHub Repository
                      </a>
                    )}
                  </div>
                </div>

                {/* Task Milestone Board */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-purple-600" /> Milestone Tasks
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tasks.map(task => (
                      <div key={task.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{task.assignedStudentName}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            task.status === 'completed' ? 'bg-teal-100 text-teal-800' :
                            task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-slate-700 font-medium">{task.title}</p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">Due: {task.dueDate}</span>
                          
                          <select
                            value={task.status}
                            onChange={(e) => onUpdateTaskStatus(proj.id, task.id, e.target.value as any)}
                            className="text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold text-slate-800 outline-none"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
