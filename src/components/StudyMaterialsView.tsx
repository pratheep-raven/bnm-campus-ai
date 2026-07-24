import React, { useState } from 'react';
import {
  User,
  StudyMaterial,
  Subject
} from '../types';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Download,
  ExternalLink,
  Presentation,
  Link as LinkIcon
} from 'lucide-react';
import { EmptyState } from './EmptyState';

interface StudyMaterialsViewProps {
  currentUser: User;
  materials: StudyMaterial[];
  subjects: Subject[];
  onOpenCreateMaterial: () => void;
}

export const StudyMaterialsView: React.FC<StudyMaterialsViewProps> = ({
  currentUser,
  materials,
  subjects,
  onOpenCreateMaterial
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMaterials = (materials || []).filter(mat => {
    const matchesSubject = selectedSubjectFilter === 'all' || mat.subjectId === selectedSubjectFilter;
    const matchesUnit = selectedUnitFilter === 'all' || mat.unitNumber === Number(selectedUnitFilter);
    const matchesSearch = mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mat.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesUnit && matchesSearch;
  });

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'slides': return <Presentation className="w-5 h-5 text-purple-600" />;
      case 'link': return <LinkIcon className="w-5 h-5 text-blue-600" />;
      default: return <FileText className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Study Materials Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            VTU syllabus notes, lab manuals, lecture slides & study handouts
          </p>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            onClick={onOpenCreateMaterial}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900 text-white font-bold text-xs hover:bg-indigo-800 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Study Notes
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, topics, syllabus..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Subject:</span>
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Unit:</span>
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Units</option>
              <option value="1">Unit 1</option>
              <option value="2">Unit 2</option>
              <option value="3">Unit 3</option>
              <option value="4">Unit 4</option>
              <option value="5">Unit 5</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          title="No study materials uploaded"
          description="No study notes exist in Supabase database for the selected criteria."
          actionText={currentUser.role === 'teacher' ? "Upload Material" : undefined}
          onAction={currentUser.role === 'teacher' ? onOpenCreateMaterial : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map(mat => (
            <div key={mat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileTypeIcon(mat.fileType)}
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800">
                      {mat.subjectName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
                    Unit {mat.unitNumber}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{mat.title}</h3>
                <p className="text-xs text-slate-600">{mat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  Uploaded by {mat.teacherName}
                </div>

                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-900 text-white font-bold text-xs hover:bg-indigo-800 transition-all shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Download / Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
