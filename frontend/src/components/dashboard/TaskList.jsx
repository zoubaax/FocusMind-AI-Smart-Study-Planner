import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Clock, BookOpen, Calendar as CalendarIcon, 
  Sparkles, ChevronRight, Search, Plus, Filter, Trash2, X, 
  Tag, AlertCircle, TrendingUp, Calendar, LayoutGrid, List,
  ArrowUpDown, ChevronDown, BarChart3, Award, Flame,
  Target, Zap, Settings, SortAsc, SortDesc
} from 'lucide-react';
import taskService from '../../services/taskService';
import { toast } from 'react-hot-toast';

const TaskList = ({ isFullPage = false }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grouped');
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
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
      toast.success(updated.completed ? 'Task completed! 🎉' : 'Task reopened');
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
    const order = sortOrder === 'asc' ? 1 : -1;
    
    if (sortBy === 'time') {
      return tasksCopy.sort((a, b) => order * (new Date(a.startTime) - new Date(b.startTime)));
    } else if (sortBy === 'priority') {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return tasksCopy.sort((a, b) => order * (priorityOrder[a.priority] - priorityOrder[b.priority]));
    } else if (sortBy === 'subject') {
      return tasksCopy.sort((a, b) => order * a.subject.localeCompare(b.subject));
    }
    return tasksCopy;
  }, [filteredTasks, sortBy, sortOrder]);

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
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getPriorityInfo = (priority) => {
    const priorities = {
      HIGH: { label: 'High', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: Zap },
      MEDIUM: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Target },
      LOW: { label: 'Low', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Circle }
    };
    return priorities[priority] || priorities.MEDIUM;
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;
    const todayTasks = tasks.filter(t => {
      const today = new Date().toDateString();
      return new Date(t.startTime).toDateString() === today;
    }).length;
    const upcomingTasks = tasks.filter(t => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return new Date(t.startTime).toDateString() === tomorrow.toDateString();
    }).length;
    
    return { total, completed, percent, todayTasks, upcomingTasks };
  };

  const stats = getStats();

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Total</span>
            <BookOpen className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-0.5">tasks</div>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Completed</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{stats.completed}</div>
          <div className="text-xs text-emerald-600 mt-0.5">{stats.percent.toFixed(0)}% done</div>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Today</span>
            <Calendar className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{stats.todayTasks}</div>
          <div className="text-xs text-slate-400 mt-0.5">due today</div>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Upcoming</span>
            <TrendingUp className="w-3 h-3 text-amber-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{stats.upcomingTasks}</div>
          <div className="text-xs text-slate-400 mt-0.5">tomorrow</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex justify-between text-xs text-slate-600 mb-2">
          <span className="font-medium">Weekly Progress</span>
          <span className="font-medium">{stats.percent.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-slate-800 rounded-full"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-slate-100 border-slate-300 text-slate-700' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
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
              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-slate-500 mr-1">Status:</span>
                  {['ALL', 'TODO', 'COMPLETED'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        filter === f 
                          ? 'bg-slate-800 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f === 'TODO' ? 'To Do' : 'Done'}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-slate-500 mr-1">View:</span>
                  <button
                    onClick={() => setViewMode('grouped')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                      viewMode === 'grouped' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    Grouped
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                      viewMode === 'list' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <List className="w-3 h-3" />
                    List
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-medium text-slate-500 mr-1">Sort by:</span>
                  <div className="flex gap-1">
                    {[
                      { value: 'time', label: 'Time', icon: Clock },
                      { value: 'priority', label: 'Priority', icon: Target },
                      { value: 'subject', label: 'Subject', icon: BookOpen }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (sortBy === option.value) {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy(option.value);
                            setSortOrder('asc');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          sortBy === option.value 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <option.icon className="w-3 h-3" />
                        {option.label}
                        {sortBy === option.value && (
                          sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task List */}
      <AnimatePresence mode="popLayout">
        {sortedTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg border border-slate-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks found</h3>
            <p className="text-sm text-slate-500">
              {search ? 'Try adjusting your search' : 'Create your first task to get started'}
            </p>
            {!search && (
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Create Task
              </button>
            )}
          </motion.div>
        ) : viewMode === 'grouped' && groupedTasks ? (
          groupedTasks.map((group) => (
            <motion.div
              layout
              key={group.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-700">{formatDate(group.date)}</h3>
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400">{group.tasks.length} tasks</span>
              </div>
              <div className="space-y-2">
                {group.tasks.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    formatTime={formatTime}
                    getPriorityInfo={getPriorityInfo}
                    index={idx}
                  />
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                formatTime={formatTime}
                getPriorityInfo={getPriorityInfo}
                index={idx}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setIsAdding(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">Create New Task</h2>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="e.g., Mathematics, Design"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Task Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={newTask.topic}
                      onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 h-24 resize-none"
                      placeholder="Describe what needs to be done"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newTask.startTime}
                        onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newTask.endTime}
                        onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'HIGH', label: 'High', color: 'red' },
                        { value: 'MEDIUM', label: 'Medium', color: 'amber' },
                        { value: 'LOW', label: 'Low', color: 'blue' }
                      ].map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setNewTask({ ...newTask, priority: p.value })}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            newTask.priority === p.value
                              ? p.color === 'red'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : p.color === 'amber'
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
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

// Modern Task Card Component
const TaskCard = ({ task, onToggle, onDelete, formatTime, getPriorityInfo, index }) => {
  const priority = getPriorityInfo(task.priority);
  const PriorityIcon = priority.icon;
  const isOverdue = !task.completed && new Date(task.endTime) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`group bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        task.completed 
          ? 'border-slate-200 bg-slate-50/50' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
      onClick={() => onToggle(task.id)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-0.5">
          <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300 group-hover:border-slate-400'
          }`}>
            {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {task.subject}
            </span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${priority.bg} ${priority.text}`}>
              <PriorityIcon className="w-2.5 h-2.5" />
              {priority.label}
            </span>
            {isOverdue && !task.completed && (
              <span className="text-xs font-medium bg-red-50 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                Overdue
              </span>
            )}
          </div>
          
          <h4 className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {task.topic}
          </h4>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(task.startTime)} - {formatTime(task.endTime)}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => onDelete(e, task.id)}
          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskList;