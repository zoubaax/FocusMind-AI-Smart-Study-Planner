import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Download, FileText, Clock, Sparkles, 
  ChevronRight, Eye, MoreVertical, Trash2, 
  Share2, Star, BarChart3, CheckCircle2,
  FileArchive, FileSpreadsheet, FileImage, File,
  LayoutGrid, List, Search, Filter, X,
  TrendingUp, Clock as ClockIcon, HardDrive
} from 'lucide-react';

const ScheduleList = ({ schedules, onGenerate, onDelete, onShare }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="w-5 h-5" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <FileArchive className="w-5 h-5 text-amber-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  const getFileTypeLabel = (fileType) => {
    if (!fileType) return 'FILE';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'SHEET';
    if (fileType.includes('image')) return 'IMAGE';
    if (fileType.includes('word')) return 'DOC';
    return fileType.split('/')[1]?.toUpperCase() || 'FILE';
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || getFileTypeLabel(schedule.fileType).toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const fileTypes = ['all', 'pdf', 'sheet', 'image', 'doc'];

  if (schedules.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 border border-slate-200 rounded-2xl shadow-sm"
      >
        <div className="relative p-16 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full blur-2xl opacity-20"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border border-slate-200 shadow-inner">
              <Calendar className="w-12 h-12 text-slate-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">No schedules yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Upload your first schedule to generate AI-powered study plans
          </p>
          
          <div className="flex gap-2 justify-center">
            {['PDF', 'Excel', 'Images'].map((type) => (
              <div key={type} className="px-3 py-1.5 bg-white rounded-lg text-xs text-slate-600 border border-slate-200 shadow-sm">
                {type}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            Your schedules
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredSchedules.length} {filteredSchedules.length === 1 ? 'schedule' : 'schedules'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 w-64 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 appearance-none cursor-pointer"
            >
              <option value="all">All files</option>
              <option value="pdf">PDF</option>
              <option value="sheet">Sheets</option>
              <option value="image">Images</option>
              <option value="doc">Documents</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedules Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-3"
        }
      >
        <AnimatePresence mode="popLayout">
          {filteredSchedules.map((schedule) => (
            viewMode === 'grid' ? (
              <GridCard
                key={schedule.id}
                schedule={schedule}
                getFileIcon={getFileIcon}
                getFileTypeLabel={getFileTypeLabel}
                onGenerate={onGenerate}
                onDelete={onDelete}
                onShare={onShare}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
              />
            ) : (
              <ListCard
                key={schedule.id}
                schedule={schedule}
                getFileIcon={getFileIcon}
                getFileTypeLabel={getFileTypeLabel}
                onGenerate={onGenerate}
                onDelete={onDelete}
                onShare={onShare}
              />
            )
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {filteredSchedules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-xl border border-slate-200"
        >
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No schedules match your search</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-3 text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Modern Grid Card Component
const GridCard = ({ schedule, getFileIcon, getFileTypeLabel, onGenerate, onDelete, onShare, menuOpen, setMenuOpen }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-slate-300 transition-all duration-200"
    >
      {/* Card Content */}
      <div className="p-5">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            {getFileIcon(schedule.fileType)}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setMenuOpen(menuOpen === schedule.id ? null : schedule.id)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
            
            <AnimatePresence>
              {menuOpen === schedule.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20"
                >
                  <button
                    onClick={() => {
                      window.open(schedule.fileUrl, '_blank');
                      setMenuOpen(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <a
                    href={schedule.fileUrl}
                    download
                    className="block px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  {onShare && (
                    <button
                      onClick={() => {
                        onShare(schedule);
                        setMenuOpen(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(schedule);
                        setMenuOpen(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* File Info */}
        <div className="mb-4">
          <h4 
            className="text-slate-900 font-medium mb-2 line-clamp-2 text-sm"
            title={schedule.fileName}
          >
            {schedule.fileName}
          </h4>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(schedule.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span>•</span>
            <span>{getFileTypeLabel(schedule.fileType)}</span>
          </div>
        </div>

        {/* Stats (optional) */}
        {schedule.stats && (
          <div className="mb-4 p-2.5 bg-slate-50 rounded-lg text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pages</span>
              <span className="text-slate-700 font-medium">{schedule.stats.pages || 0}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-500">Size</span>
              <span className="text-slate-700 font-medium">{schedule.stats.size || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onGenerate && onGenerate(schedule)}
          className="w-full py-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg text-white text-sm font-medium hover:from-slate-800 hover:to-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Sparkles size={14} />
          Generate plan
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

// Modern List Card Component
const ListCard = ({ schedule, getFileIcon, getFileTypeLabel, onGenerate, onDelete, onShare }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
          {getFileIcon(schedule.fileType)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-slate-900 font-medium text-sm truncate">
              {schedule.fileName}
            </h4>
            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-medium flex-shrink-0">
              {getFileTypeLabel(schedule.fileType)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <ClockIcon size={12} />
              {new Date(schedule.createdAt).toLocaleDateString()}
            </div>
            {schedule.stats && schedule.stats.pages && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <FileText size={12} />
                  {schedule.stats.pages} pages
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <a
            href={schedule.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            title="Preview"
          >
            <Eye size={14} />
          </a>
          <a
            href={schedule.fileUrl}
            download
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            title="Download"
          >
            <Download size={14} />
          </a>
          {onShare && (
            <button
              onClick={() => onShare(schedule)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              title="Share"
            >
              <Share2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(schedule)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => onGenerate && onGenerate(schedule)}
            className="ml-2 px-3 py-1.5 bg-slate-900 rounded-lg text-white text-xs font-medium hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            <Sparkles size={12} />
            Generate
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleList;