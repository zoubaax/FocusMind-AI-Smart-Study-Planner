import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Clock, BookOpen, Calendar as CalendarIcon, 
  Sparkles, ChevronRight, Search, Plus, Filter, Trash2, X, 
  Tag, AlertCircle, TrendingUp, Calendar, LayoutGrid, List,
  ArrowUpDown, ChevronDown
} from 'lucide-react';
import taskService from '../../services/taskService';
import { toast } from 'react-hot-toast';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grouped');
  const [sortBy, setSortBy] = useState('time');
  const [showFilters, setShowFilters] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTask, setNewTask] = useState({
    subject: '',
    topic: '',
    startTime: '',
    endTime: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      const updated = await taskService.toggle(taskId);
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
      toast.success(updated.completed ? '✨ Goal achieved!' : '🔄 Task reopened');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (e, taskId) => {
    e.stopPropagation();
    try {
      await taskService.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task removed');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const taskToCreate = {
        ...newTask,
        startTime: newTask.startTime ? new Date(newTask.startTime).toISOString() : null,
        endTime: newTask.endTime ? new Date(newTask.endTime).toISOString() : null
      };
      const created = await taskService.create(taskToCreate);
      setTasks([created, ...tasks]);
      setIsAdding(false);
      setNewTask({ subject: '', topic: '', startTime: '', endTime: '', priority: 'MEDIUM' });
      toast.success('Task added successfully');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = (t.subject + t.topic).toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'ALL' || 
                           (filter === 'TODO' && !t.completed) || 
                           (filter === 'COMPLETED' && t.completed);
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const sortedTasks = useMemo(() => {
    const tasksCopy = [...filteredTasks];
    if (sortBy === 'time') {
      return tasksCopy.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } else if (sortBy === 'priority') {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return tasksCopy.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
    return tasksCopy;
  }, [filteredTasks, sortBy]);

  const groupedTasks = useMemo(() => {
    if (viewMode === 'list') return null;
    
    const groups = {};
    sortedTasks.forEach(task => {
      const dateStr = new Date(task.startTime).toDateString();
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(task);
    });
    
    return Object.keys(groups)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date,
        tasks: groups[date].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      }));
  }, [sortedTasks, viewMode]);

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeDate = (dateStr) => {
    const today = new Date().toDateString();
    if (dateStr === today) return "Today";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toDateString()) return "Tomorrow";
    return new Date(dateStr).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'HIGH': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-red-500/10' };
      case 'MEDIUM': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' };
      default: return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' };
    }
  };

  const getProgressStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;
    return { total, completed, percent };
  };

  const stats = getProgressStats();

  if (loading && tasks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Container */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 pb-6 border-b border-white/10">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Task Manager
                  </h3>
                  <p className="text-gray-400 text-sm">Organize and track your daily goals</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsAdding(true)}
                className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:scale-95"
              >
                <Plus size={18} className="transition-transform group-hover:rotate-90" />
                <span>New Task</span>
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Tasks</span>
                  <LayoutGrid size={16} className="text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-500 mt-1">Active tasks</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Completed</span>
                  <CheckCircle2 size={16} className="text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.completed}</div>
                <div className="text-xs text-green-400 mt-1">{stats.percent.toFixed(0)}% complete</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Productivity</span>
                  <TrendingUp size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.percent.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 mt-1">This week</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Weekly Progress</span>
                <span>{stats.percent.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-600 text-white"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}`}
                >
                  <Filter size={18} />
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex bg-black/30 border border-white/10 p-1 rounded-xl">
                        {['ALL', 'TODO', 'COMPLETED'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                              filter === f 
                                ? 'bg-indigo-600 text-white' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {f === 'ALL' ? 'All Tasks' : f === 'TODO' ? 'To Do' : 'Completed'}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex bg-black/30 border border-white/10 p-1 rounded-xl">
                        <button
                          onClick={() => setViewMode('grouped')}
                          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'grouped' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          <Calendar size={14} />
                          <span className="text-xs">Grouped</span>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          <List size={14} />
                          <span className="text-xs">List</span>
                        </button>
                      </div>

                      <div className="flex bg-black/30 border border-white/10 p-1 rounded-xl">
                        <button
                          onClick={() => setSortBy('time')}
                          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${sortBy === 'time' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          <Clock size={14} />
                          Time
                        </button>
                        <button
                          onClick={() => setSortBy('priority')}
                          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${sortBy === 'priority' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          <ArrowUpDown size={14} />
                          Priority
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Task Content */}
        <div className="flex-1 overflow-y-auto max-h-[600px] p-8 pt-6 space-y-6 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {sortedTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <AlertCircle className="w-12 h-12 text-gray-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No tasks found</h4>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {search ? "No tasks match your search criteria" : "Get started by creating your first task"}
                </p>
                {!search && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="mt-6 px-6 py-2.5 bg-indigo-600 rounded-xl text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
                  >
                    Create Your First Task
                  </button>
                )}
              </motion.div>
            ) : viewMode === 'grouped' && groupedTasks ? (
              groupedTasks.map((group) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={group.date} 
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-indigo-500/20">
                      <span className="text-xs font-semibold text-indigo-400">
                        {getRelativeDate(group.date)}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                    <span className="text-xs text-gray-500">{group.tasks.length} tasks</span>
                  </div>

                  <div className="space-y-3">
                    {group.tasks.map((task, idx) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        formatTime={formatTime}
                        getPriorityColor={getPriorityColor}
                        index={idx}
                      />
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="space-y-3">
                {sortedTasks.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    formatTime={formatTime}
                    getPriorityColor={getPriorityColor}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsAdding(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Create New Task</h2>
                  </div>
                  <button 
                    onClick={() => setIsAdding(false)} 
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-white placeholder:text-gray-600"
                      placeholder="e.g., Mathematics, Design, Marketing"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Topic Details <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      value={newTask.topic}
                      onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-24 resize-none text-white placeholder:text-gray-600"
                      placeholder="Describe what needs to be accomplished"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Start Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newTask.startTime}
                        onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        End Time <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newTask.endTime}
                        onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <div className="flex gap-3">
                      {['HIGH', 'MEDIUM', 'LOW'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewTask({ ...newTask, priority: p })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            newTask.priority === p
                              ? p === 'HIGH'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : p === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-black/30 text-gray-500 border border-white/10 hover:bg-white/5'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Task Card Component for better organization
const TaskCard = ({ task, onToggle, onDelete, formatTime, getPriorityColor, index }) => {
  const priority = getPriorityColor(task.priority);
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onToggle(task.id)}
      className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${task.completed 
          ? 'bg-white/5 border-white/10 opacity-60' 
          : 'bg-gradient-to-r from-white/5 to-transparent border-white/10 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.01]'
        }
      `}
    >
      <div className="flex items-start gap-4 relative z-10">
        <div className="flex-shrink-0 pt-0.5">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center
              ${task.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-600 group-hover:border-indigo-500 group-hover:bg-indigo-500/20'
              }
            `}
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Circle className="w-4 h-4 text-gray-600 group-hover:text-indigo-500" />
            )}
          </motion.div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${priority.bg} ${priority.text} ${priority.border}`}>
              {task.subject}
            </span>
            <span className="text-gray-500 text-[10px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(task.startTime)} - {formatTime(task.endTime)}
            </span>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-lg border ${priority.bg} ${priority.text} ${priority.border}`}>
              {task.priority}
            </span>
          </div>
          
          <h4 className={`font-semibold transition-all duration-300
            ${task.completed ? 'text-gray-500 line-through' : 'text-white group-hover:text-indigo-400'}
          `}>
            {task.topic}
          </h4>
        </div>

        <button 
          onClick={(e) => onDelete(e, task.id)}
          className="flex-shrink-0 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Active task indicator */}
      {!task.completed && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </motion.div>
  );
};

export default TaskList;