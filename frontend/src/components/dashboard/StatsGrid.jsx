import React from 'react';
import { BarChart3, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
        <TrendingUp className="w-4 h-4" />
        +12%
      </div>
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-xs text-gray-500">{subValue}</span>
    </div>
  </div>
);

const StatsGrid = () => {
  const stats = [
    {
      title: 'Study Hours',
      value: '24.5',
      subValue: 'this week',
      icon: Clock,
      color: 'bg-indigo-500',
    },
    {
      title: 'Tasks Completed',
      value: '18',
      subValue: '/ 24 total',
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    },
    {
      title: 'Average Focus',
      value: '82%',
      subValue: '+5% vs last week',
      icon: BarChart3,
      color: 'bg-amber-500',
    },
    {
      title: 'Study Streak',
      value: '5',
      subValue: 'days in a row',
      icon: TrendingUp,
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
