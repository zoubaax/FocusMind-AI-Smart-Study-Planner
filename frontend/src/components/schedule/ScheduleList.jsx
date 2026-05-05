import React from 'react';
import { Calendar, Download, FileText, Clock } from 'lucide-react';

const ScheduleList = ({ schedules }) => {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-2xl">
        <Calendar className="w-12 h-12 text-white/20 mb-4" />
        <p className="text-gray-400">No schedules uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {schedules.map((schedule) => (
        <div 
          key={schedule.id}
          className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <a 
              href={schedule.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              title="Download/View"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>

          <h4 className="text-white font-medium truncate mb-2" title={schedule.fileName}>
            {schedule.fileName}
          </h4>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {new Date(schedule.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-wider text-gray-400 border border-white/10">
              {schedule.fileType || 'FILE'}
            </span>
            <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Generate Plan →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;
