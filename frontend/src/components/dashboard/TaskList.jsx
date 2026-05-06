import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Clock, BookOpen, Calendar as CalendarIcon, 
  Stars, ChevronRight, Search, Plus, Filter, Trash2, X, 
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
      case 'HIGH': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200/60', glow: 'shadow-red-200/50' };
      case 'MEDIUM': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/60', glow: 'shadow-amber-200/50' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200/60', glow: 'shadow-blue-200/50' };
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
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-8 animate-pulse shadow-xl">
        <div className="h-8 w-48 bg-slate-100 rounded-lg mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Container */}
      <div className="bg-white/85 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-300/50">
        
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-200/50 via-slate-100/30 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative p-8 pb-6 border-b border-slate-200/60">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-slate-900 rounded-2xl blur-xl opacity-20"></div>
                  <div className="relative w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-300">
                    <BookOpen className="w-6 h-6 text-slate-100" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Task Manager
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">Organize and track your daily goals</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsAdding(true)}
                className="group relative flex items-center gap-2 px-6 py-2.5 bg-slate-900 rounded-xl font-bold text-sm transition-all duration-300 hover:bg-slate-800 shadow-xl shadow-slate-300 hover:-translate-y-0.5 active:scale-95 text-white"
              >
                <Plus size={18} className="transition-transform group-hover:rotate-90" />
                <span>New Task</span>
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm font-bold">Total Tasks</span>
                  <LayoutGrid size={16} className="text-slate-700" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Active tasks</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm font-bold">Completed</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.completed}</div>
                <div className="text-xs text-emerald-600 mt-1 font-semibold">{stats.percent.toFixed(0)}% complete</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm font-bold">Productivity</span>
                  <TrendingUp size={16} className="text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.percent.toFixed(0)}%</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">This week</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2 font-semibold">
                <span>Weekly Progress</span>
                <span>{stats.percent.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-slate-900 rounded-full"
                />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-sm transition-all placeholder:text-slate-400 text-slate-900 shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl border transition-all ${showFilters ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200/60 text-slate-600 hover:text-slate-900 shadow-sm'}`}
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
                      <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl shadow-sm">
                        {['ALL', 'TODO', 'COMPLETED'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              filter === f 
                                ? 'bg-slate-900 text-white' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            {f === 'ALL' ? 'All Tasks' : f === 'TODO' ? 'To Do' : 'Completed'}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl shadow-sm">
                        <button
                          onClick={() => setViewMode('grouped')}
                          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'grouped' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          <Calendar size={14} />
                          <span className="text-xs">Grouped</span>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          <List size={14} />
                          <span className="text-xs">List</span>
                        </button>
                      </div>

                      <div className="flex bg-slate-50 border border-slate-200/60 p-1 rounded-xl shadow-sm">
                        <button
                          onClick={() => setSortBy('time')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${sortBy === 'time' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          <Clock size={14} />
                          Time
                        </button>
                        <button
                          onClick={() => setSortBy('priority')}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${sortBy === 'priority' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
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
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-200/60 shadow-sm">
                  <AlertCircle className="w-12 h-12 text-slate-400" />
                </div>
                <h4 className="text-xl font-black text-slate-700 mb-2">No tasks found</h4>
                <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
                  {search ? "No tasks match your search criteria" : "Get started by creating your first task"}
                </p>
                {!search && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="mt-6 px-6 py-2.5 bg-slate-900 rounded-xl text-white text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg"
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
                    <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700">
                        {getRelativeDate(group.date)}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200/60"></div>
                    <span className="text-xs text-slate-400 font-semibold">{group.tasks.length} tasks</span>
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
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
              onClick={() => setIsAdding(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-slate-200/60 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-200/60 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-xl shadow-lg">
                      <Stars className="w-5 h-5 text-slate-100" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Create New Task</h2>
                  </div>
                  <button 
                    onClick={() => setIsAdding(false)} 
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Subject <span className="text-red-600">*</span>
                    </label>
                    <input
                      required
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                      placeholder="e.g., Mathematics, Design, Marketing"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Topic Details <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      required
                      value={newTask.topic}
                      onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all h-24 resize-none text-slate-900 placeholder:text-slate-400 shadow-sm"
                      placeholder="Describe what needs to be accomplished"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Start Time <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newTask.startTime}
                        onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-slate-900 text-sm shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        End Time <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newTask.endTime}
                        onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-slate-900 text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <div className="flex gap-3">
                      {['HIGH', 'MEDIUM', 'LOW'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewTask({ ...newTask, priority: p })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            newTask.priority === p
                              ? p === 'HIGH'
                                ? 'bg-red-50 text-red-600 border border-red-200/60'
                                : p === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                                : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                              : 'bg-slate-50 text-slate-500 border border-slate-200/60 hover:bg-slate-100'
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
                      className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg"
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
          ? 'bg-slate-50 border-slate-200/60 opacity-60' 
          : 'bg-white border-slate-200/60 hover:border-slate-900/30 hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.01]'
        }
      `}
    >
      <div className="flex items-start gap-4 relative z-10">
        <div className="flex-shrink-0 pt-0.5">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center
              ${task.completed 
                ? 'bg-emerald-600 border-emerald-600' 
                : 'border-slate-300 group-hover:border-slate-900 group-hover:bg-slate-900/10'
              }
            `}
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
            )}
          </motion.div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${priority.bg} ${priority.text} ${priority.border}`}>
              {task.subject}
            </span>
            <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(task.startTime)} - {formatTime(task.endTime)}
            </span>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-lg border ${priority.bg} ${priority.text} ${priority.border}`}>
              {task.priority}
            </span>
          </div>
          
          <h4 className={`font-bold transition-all duration-300
            ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-slate-700'}
          `}>
            {task.topic}
          </h4>
        </div>

        <button 
          onClick={(e) => onDelete(e, task.id)}
          className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Active task indicator */}
      {!task.completed && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </motion.div>
  );
};

export default TaskList;