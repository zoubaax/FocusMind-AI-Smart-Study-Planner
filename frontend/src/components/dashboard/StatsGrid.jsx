import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  Flame,
  Activity,
  Brain,
  Zap,
  BookOpen,
  FileText
} from 'lucide-react';
import taskService from '../../services/taskService';
import scheduleService from '../../services/scheduleService';

const StatCard = ({ title, value, subValue, icon: Icon, trend, color, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getColorClasses = (color) => {
    const colors = {
      slate: { bg: 'bg-slate-50', icon: 'text-slate-600', border: 'border-slate-100' },
      emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
      amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
      rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    };
    return colors[color] || colors.slate;
  };
  
  const colorClasses = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl border border-slate-200 p-5 transition-all duration-300 hover:shadow-md hover:border-slate-300"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-slate-50/50 rounded-xl transition-all duration-500 pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${colorClasses.bg} transition-all duration-300 group-hover:scale-105`}>
            <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
          </div>
          
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${
              trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-slate-400'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-2xl font-semibold text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {subValue && (
            <span className="text-sm text-slate-400 ml-1">{subValue}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </h3>
      </div>
    </motion.div>
  );
};

const StatsGrid = () => {
  const [stats, setStats] = useState({
    completed: 0,
    total: 0,
    hours: 0,
    focus: 0,
    schedules: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      const tasks = await taskService.getAll();
      const completed = tasks.filter(t => t.completed).length;
      const total = tasks.length;
      const focus = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Calculate total hours from tasks
      const hours = tasks.reduce((acc, t) => {
        if (t.startTime && t.endTime) {
          const duration = (new Date(t.endTime) - new Date(t.startTime)) / (1000 * 60 * 60);
          return acc + (duration > 0 ? duration : 0);
        }
        return acc;
      }, 0);
      
      // Fetch schedules count
      let schedulesCount = 0;
      try {
        const schedules = await scheduleService.getAll();
        schedulesCount = schedules.length;
      } catch (err) {
        console.error('Failed to fetch schedules', err);
      }
      
      // Calculate streak (consecutive days with completed tasks)
      let streak = 0;
      if (tasks.length > 0) {
        const today = new Date().toDateString();
        const hasTodayTask = tasks.some(t => 
          t.completed && new Date(t.endTime).toDateString() === today
        );
        
        if (hasTodayTask) {
          streak = 1;
          let checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - 1);
          
          while (true) {
            const hasTaskOnDate = tasks.some(t => 
              t.completed && new Date(t.endTime).toDateString() === checkDate.toDateString()
            );
            
            if (hasTaskOnDate) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }
      
      setStats({
        completed,
        total,
        hours: Math.round(hours * 10) / 10,
        focus,
        schedules: schedulesCount,
        streak
      });
    } catch (err) {
      console.error('Stats fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      title: 'Study Hours',
      value: stats.hours,
      subValue: 'hours',
      icon: Clock,
      color: 'slate',
      trend: stats.hours > 0 ? 12 : null
    },
    {
      title: 'Tasks Completed',
      value: stats.completed,
      subValue: `/ ${stats.total}`,
      icon: CheckCircle2,
      color: 'emerald',
      trend: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : null
    },
    {
      title: 'Completion Rate',
      value: `${stats.focus}%`,
      subValue: 'success',
      icon: Target,
      color: 'amber',
      trend: stats.focus > 0 ? stats.focus - 50 : null
    },
    {
      title: 'Study Streak',
      value: stats.streak,
      subValue: 'days',
      icon: Flame,
      color: 'rose',
      trend: stats.streak > 0 ? 5 : null
    },
    {
      title: 'Schedules',
      value: stats.schedules,
      subValue: 'uploaded',
      icon: FileText,
      color: 'blue',
      trend: null
    },
    {
      title: 'Focus Score',
      value: Math.min(100, Math.max(0, Math.round(stats.focus * 0.8 + (stats.streak * 2)))),
      subValue: 'points',
      icon: Brain,
      color: 'purple',
      trend: stats.focus > 0 ? 8 : null
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                <div className="w-12 h-4 bg-slate-100 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-slate-100 rounded mb-2"></div>
              <div className="w-24 h-3 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statItems.map((stat, i) => (
          <StatCard key={i} {...stat} delay={i} />
        ))}
      </div>
      
      {/* Quick Insight Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 p-3"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <span className="text-xs text-slate-600">
              {stats.total === 0 
                ? "Start by creating your first task" 
                : stats.focus >= 80 
                ? "Excellent progress! Keep up the momentum 🎯" 
                : stats.focus >= 50 
                ? "Good progress, you're on the right track 📈" 
                : "Keep going! Every task completed is a step forward 💪"}
            </span>
          </div>
          
          {stats.total > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.focus}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full bg-slate-700 rounded-full"
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500">{stats.focus}%</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {stats.total - stats.completed} remaining
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsGrid;