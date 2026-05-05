import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import taskService from '../../services/taskService';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex items-center gap-1 text-green-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <TrendingUp className="w-4 h-4" />
        Live
      </div>
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
      <span className="text-xs text-gray-500 font-medium">{subValue}</span>
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
      color: 'bg-indigo-500',
    },
    {
      title: 'Tasks Completed',
      value: taskData.completed,
      subValue: `/ ${taskData.total} total`,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    },
    {
      title: 'Success Rate',
      value: `${taskData.focus}%`,
      subValue: 'completion score',
      icon: BarChart3,
      color: 'bg-amber-500',
    },
    {
      title: 'Active Plans',
      value: taskData.total > 0 ? Math.ceil(taskData.total / 10) : 0, // Approx
      subValue: 'linked to schedules',
      icon: TrendingUp,
      color: 'bg-rose-500',
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
