import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, BookOpen, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import taskService from '../../services/taskService';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll();
      // Sort by start time
      const sorted = data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setTasks(sorted);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (taskId) => {
    try {
      const updated = await taskService.toggle(taskId);
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-[#0f0f12] border border-white/10 rounded-[32px] p-8 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-lg mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f12] border border-white/10 rounded-[32px] overflow-hidden flex flex-col h-full shadow-xl shadow-indigo-500/5">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Your Study Roadmap</h3>
        </div>
        <div className="px-4 py-1.5 bg-indigo-600/20 rounded-full border border-indigo-500/20">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            {tasks.filter(t => !t.completed).length} Tasks Left
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No tasks active yet.</p>
            <p className="text-gray-600 text-sm mt-1">Generate and activate a plan to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => handleToggle(task.id)}
              className={`group relative p-5 rounded-3xl border transition-all cursor-pointer overflow-hidden
                ${task.completed 
                  ? 'bg-green-500/5 border-green-500/20 opacity-60' 
                  : 'bg-white/5 border-white/10 hover:border-indigo-500/30 hover:bg-white/10'}
              `}
            >
              <div className="flex items-start gap-4">
                <button className="mt-1 flex-shrink-0 transition-transform group-hover:scale-110">
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-600 group-hover:text-indigo-500" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md
                      ${task.completed ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'}
                    `}>
                      {task.subject}
                    </span>
                    <span className="text-gray-600 text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(task.startTime)} - {formatTime(task.endTime)}
                    </span>
                  </div>
                  
                  <h4 className={`text-sm font-bold truncate transition-all
                    ${task.completed ? 'text-gray-500 line-through' : 'text-gray-100 group-hover:text-white'}
                  `}>
                    {task.topic}
                  </h4>
                  
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {formatDate(task.startTime)}
                  </p>
                </div>
              </div>

              {/* Progress bar effect on active tasks */}
              {!task.completed && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-indigo-500/20 w-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-1/3 animate-pulse"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
