import React from 'react';
import { BookOpen, Sparkles, BrainCircuit, ChevronRight, FileText, Trash2, Clock } from 'lucide-react';

const FlashcardVault = ({ materials, onSelect, onGenerate, onDelete }) => {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No course materials yet</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">
          Upload your first course PDF above to start generating AI flashcards.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {materials.map((material) => (
        <div 
          key={material.id}
          className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <button 
              onClick={() => onDelete(material.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1">
            {material.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-6">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(material.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(material)}
              className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              Study Cards
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGenerate(material.id)}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              title="Generate AI Cards"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashcardVault;
