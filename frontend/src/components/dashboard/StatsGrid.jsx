import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import taskService from '../../services/taskService';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white/85 border border-slate-200/60 p-6 rounded-[2rem] backdrop-blur-xl hover:bg-white shadow-xl shadow-slate-200/50 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        <TrendingUp className="w-4 h-4" />
        Live
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-bold mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
      <span className="text-xs text-slate-400 font-medium">{subValue}</span>
    </div>
  </div>
);

const StatsGrid = () => {
  const [taskData, setTaskData] = useState({
    completed: 0,
    total: 0,
    hours: 0,
    focus: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasks = await taskService.getAll();
        const completed = tasks.filter(t => t.completed).length;
        
        // Calculate total hours from tasks
        const hours = tasks.reduce((acc, t) => {
          const duration = (new Date(t.endTime) - new Date(t.startTime)) / (1000 * 60 * 60);
          return acc + duration;
        }, 0);

        setTaskData({
          completed,
          total: tasks.length,
          hours: Math.round(hours * 10) / 10,
          focus: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
        });
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: 'Total Study Hours',
      value: taskData.hours,
      subValue: 'planned sessions',
      icon: Clock,
      color: 'bg-slate-700',
    },
    {
      title: 'Tasks Completed',
      value: taskData.completed,
      subValue: `/ ${taskData.total} total`,
      icon: CheckCircle2,
      color: 'bg-emerald-600',
    },
    {
      title: 'Success Rate',
      value: `${taskData.focus}%`,
      subValue: 'completion score',
      icon: BarChart3,
      color: 'bg-amber-600',
    },
    {
      title: 'Active Plans',
      value: taskData.total > 0 ? Math.ceil(taskData.total / 10) : 0, // Approx
      subValue: 'linked to schedules',
      icon: TrendingUp,
      color: 'bg-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
