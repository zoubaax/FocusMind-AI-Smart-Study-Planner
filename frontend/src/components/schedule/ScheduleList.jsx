import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Download, FileText, Clock, Sparkles, 
  ChevronRight, Eye, MoreVertical, Trash2, 
  Share2, Star, BarChart3, CheckCircle2,
  FileArchive, FileSpreadsheet, FileImage, File,
  LayoutGrid, List, Search, Filter
} from 'lucide-react';

const ScheduleList = ({ schedules, onGenerate, onDelete, onShare }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText className="w-6 h-6" />;
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-400" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-green-400" />;
    if (fileType.includes('image')) return <FileImage className="w-6 h-6 text-blue-400" />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <FileArchive className="w-6 h-6 text-amber-400" />;
    return <FileText className="w-6 h-6 text-indigo-400" />;
  };

  const getFileTypeLabel = (fileType) => {
    if (!fileType) return 'FILE';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'SHEET';
    if (fileType.includes('image')) return 'IMAGE';
    if (fileType.includes('word')) return 'DOC';
    return fileType.split('/')[1]?.toUpperCase() || 'FILE';
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (schedules.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-white/10 rounded-3xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative p-12 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full flex items-center justify-center border border-indigo-500/30">
              <Calendar className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-white mb-2">No Schedules Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Upload your first schedule to start generating AI-powered study plans
          </p>
          
          <div className="flex gap-3 justify-center">
            <div className="px-4 py-2 bg-white/5 rounded-xl text-sm text-gray-400 flex items-center gap-2">
              <FileText size={14} />
              <span>PDF</span>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl text-sm text-gray-400 flex items-center gap-2">
              <FileSpreadsheet size={14} />
              <span>Excel</span>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl text-sm text-gray-400 flex items-center gap-2">
              <FileImage size={14} />
              <span>Images</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Your Schedules
          </h3>
          <p className="text-gray-400 text-sm">
            {filteredSchedules.length} {filteredSchedules.length === 1 ? 'schedule' : 'schedules'} uploaded
          </p>
        </div>

        <div className="flex gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-black/30 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedules Grid/List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }
      >
        <AnimatePresence mode="popLayout">
          {filteredSchedules.map((schedule) => (
            viewMode === 'grid' ? (
              <GridCard
                key={schedule.id}
                schedule={schedule}
                variants={cardVariants}
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
                variants={cardVariants}
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

      {/* No Results State */}
      {filteredSchedules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
        >
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No schedules match your search</p>
        </motion.div>
      )}
    </div>
  );
};

// Grid Card Component
const GridCard = ({ schedule, variants, getFileIcon, getFileTypeLabel, onGenerate, onDelete, onShare, menuOpen, setMenuOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      variants={variants}
      layout
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 via-purple-600/0 to-transparent group-hover:from-indigo-600/5 group-hover:via-purple-600/5 transition-all duration-500"></div>
      
      {/* Premium Badge (optional - for featured schedules) */}
      {schedule.isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <div className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
            <Star size={10} />
            Featured
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              {getFileIcon(schedule.fileType)}
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setMenuOpen(menuOpen === schedule.id ? null : schedule.id)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {menuOpen === schedule.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
                >
                  <button
                    onClick={() => {
                      window.open(schedule.fileUrl, '_blank');
                      setMenuOpen(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 transition-colors"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <a
                    href={schedule.fileUrl}
                    download
                    className="block px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 transition-colors"
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
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 transition-colors"
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
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/10"
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
            className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors"
            title={schedule.fileName}
          >
            {schedule.fileName}
          </h4>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(schedule.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {getFileTypeLabel(schedule.fileType)}
            </div>
          </div>
        </div>

        {/* Stats (optional) */}
        {schedule.stats && (
          <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Pages</span>
              <span className="text-white font-medium">{schedule.stats.pages || 0}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">Size</span>
              <span className="text-white font-medium">{schedule.stats.size || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onGenerate && onGenerate(schedule)}
          className="relative w-full mt-2 py-2.5 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm font-semibold hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 group/btn flex items-center justify-center gap-2 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles size={14} className="group-hover/btn:rotate-12 transition-transform" />
            Generate AI Plan
            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </motion.div>
  );
};

// List Card Component
const ListCard = ({ schedule, variants, getFileIcon, getFileTypeLabel, onGenerate, onDelete, onShare }) => {
  return (
    <motion.div
      variants={variants}
      layout
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20 }}
      className="group relative bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
          {getFileIcon(schedule.fileType)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors">
              {schedule.fileName}
            </h4>
            <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-gray-400">
              {getFileTypeLabel(schedule.fileType)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(schedule.createdAt).toLocaleDateString()}
            </div>
            {schedule.stats && (
              <>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {schedule.stats.pages || 0} pages
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={schedule.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Preview"
          >
            <Eye size={16} />
          </a>
          <a
            href={schedule.fileUrl}
            download
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Download"
          >
            <Download size={16} />
          </a>
          {onShare && (
            <button
              onClick={() => onShare(schedule)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(schedule)}
              className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={() => onGenerate && onGenerate(schedule)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles size={14} />
            Generate
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleList;