import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/schedule/FileUpload';
import ScheduleList from '../components/schedule/ScheduleList';
import PlanGenerator from '../components/plan/PlanGenerator';
import StatsGrid from '../components/dashboard/StatsGrid';
import AIChat from '../components/dashboard/AIChat';
import TaskList from '../components/dashboard/TaskList';
import scheduleService from '../services/scheduleService';
import { 
  Layout, 
  LogOut, 
  User, 
  Plus, 
  Loader2, 
  X, 
  FileText, 
  CheckSquare, 
  MessageSquare,
  Stars,
  BookOpen,
  Clock3,
  Coffee,
  PenLine,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedScheduleForPlan, setSelectedScheduleForPlan] = useState(null);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await scheduleService.getAll();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to fetch schedules', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newSchedule) => {
    setSchedules([newSchedule, ...schedules]);
    setShowUpload(false);
  };

  const handlePlanActivated = () => {
    setTaskRefreshKey(prev => prev + 1);
  };

  // Helper to get active tab from path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'overview';
    return path.split('/').pop();
  };

  const activeTab = getActiveTab();

  const NavItem = ({ to, icon: Icon, label, end = false }) => (
    <NavLink 
      to={to}
      end={end}
      className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
        isActive 
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' 
          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );

  return (
    <div className="relative min-h-screen bg-[#fbf7ef] text-slate-900">
      {/* Soft paper background */}
      <div className="absolute inset-0 bg-[linear-gradient(#eadfce_1px,transparent_1px),linear-gradient(90deg,#eadfce_1px,transparent_1px)] bg-[size:42px_42px] opacity-35 pointer-events-none" />
      <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-slate-300/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />

      {/* Floating decorative items */}
      <div className="absolute left-[5%] top-[15%] hidden rotate-[-12deg] rounded-3xl bg-white p-4 shadow-xl ring-1 ring-black/5 xl:block">
        <BookOpen className="h-6 w-6 text-slate-600" />
        <p className="mt-2 text-xs font-bold">Study Plan</p>
      </div>

      <div className="absolute right-[8%] top-[12%] hidden rotate-[10deg] rounded-full bg-white px-4 py-2 shadow-xl ring-1 ring-black/5 xl:flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-slate-600" />
        <span className="text-xs font-bold">Focus Time</span>
      </div>

      <div className="absolute bottom-[20%] left-[6%] hidden rotate-[8deg] rounded-3xl bg-slate-100 p-4 shadow-xl xl:block">
        <PenLine className="h-5 w-5 text-slate-700" />
        <p className="mt-2 max-w-[100px] text-xs font-bold">Track Progress</p>
      </div>

      <div className="absolute bottom-[18%] right-[8%] hidden rotate-[-8deg] rounded-3xl bg-white p-4 shadow-xl ring-1 ring-black/5 xl:block">
        <Coffee className="h-5 w-5 text-slate-500" />
        <p className="mt-2 text-xs font-bold">Take Breaks</p>
      </div>

      <div className="relative z-10 flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200/60 bg-white/85 backdrop-blur-xl flex flex-col sticky top-0 h-screen shadow-xl shadow-slate-200/50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-[1.4rem] flex items-center justify-center shadow-xl shadow-slate-300">
              <Stars className="w-6 h-6 text-slate-100" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block">StudyFlow</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">AI Planner</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          <NavItem to="/dashboard" icon={Layout} label="Overview" end />
          <NavItem to="/dashboard/schedules" icon={FileText} label="Schedules" />
          <NavItem to="/dashboard/tasks" icon={CheckSquare} label="Daily Tasks" />
          <NavItem to="/dashboard/chat" icon={MessageSquare} label="AI Assistant" />
          <div className="pt-4 mt-4 border-t border-slate-200/60">
            <NavItem to="/dashboard/profile" icon={User} label="My Profile" />
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-slate-200/60">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200/60">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Logged in as</p>
            <p className="text-sm font-semibold truncate text-slate-700">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-8 flex items-center justify-between sticky top-0 bg-[#fbf7ef]/80 backdrop-blur-md z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'schedules' && 'Study Schedules'}
              {activeTab === 'tasks' && 'Daily Focus'}
              {activeTab === 'chat' && 'AI Study Assistant'}
              {activeTab === 'profile' && 'User Profile'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {activeTab === 'overview' && 'Track your progress and AI insights.'}
              {activeTab === 'schedules' && 'Manage your uploaded school schedules.'}
              {activeTab === 'tasks' && 'Actionable tasks for your study plan.'}
              {activeTab === 'chat' && 'Chat with AI to optimize your learning.'}
              {activeTab === 'profile' && 'Manage your account settings.'}
            </p>
          </div>
          
          {activeTab === 'schedules' && (
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl
                ${showUpload 
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-black/5' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300'}
              `}
            >
              {showUpload ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showUpload ? 'Cancel' : 'New Schedule'}
            </button>
          )}
        </header>

        <div className="px-8 pb-12">
          <Routes>
            <Route index element={
              <div className="animate-in fade-in duration-500">
                <StatsGrid />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                  <div className="lg:col-span-7">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900">
                      <MessageSquare className="w-5 h-5 text-slate-700" />
                      Quick AI Assistant
                    </h2>
                    <AIChat />
                  </div>
                  <div className="lg:col-span-5 flex flex-col min-h-[600px]">
                    <TaskList key={taskRefreshKey} />
                  </div>
                </div>
              </div>
            } />

            <Route path="schedules" element={
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {showUpload && (
                  <div className="mb-12">
                    <div className="bg-white/85 border border-slate-200/60 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl shadow-slate-300/50">
                      <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
                        <Plus className="w-6 h-6 text-slate-700" />
                        Upload New Schedule
                      </h2>
                      <FileUpload onUploadSuccess={handleUploadSuccess} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900">Your Schedules</h2>
                  <div className="text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full ring-1 ring-black/5">
                    {schedules.length} total
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/85 rounded-[2rem] border border-slate-200/60 shadow-xl">
                    <Loader2 className="w-10 h-10 text-slate-700 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading your data...</p>
                  </div>
                ) : (
                  <ScheduleList schedules={schedules} onGenerate={(s) => setSelectedScheduleForPlan(s)} />
                )}
              </div>
            } />

            <Route path="tasks" element={
              <div className="animate-in fade-in duration-500 min-h-screen">
                <TaskList key={taskRefreshKey} isFullPage={true} />
              </div>
            } />

            <Route path="chat" element={
              <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
                <AIChat />
              </div>
            } />
            
            <Route path="profile" element={
              <div className="animate-in fade-in duration-500 py-20 text-center bg-white/85 rounded-[2rem] border border-slate-200/60 shadow-2xl shadow-slate-300/50 backdrop-blur-xl">
                <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h2 className="text-xl font-black text-slate-700">Profile Settings</h2>
                <p className="text-slate-500 mt-2 font-medium">Personalize your study preferences.</p>
              </div>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      </div>

      {selectedScheduleForPlan && (
        <PlanGenerator 
          schedule={selectedScheduleForPlan} 
          onClose={() => setSelectedScheduleForPlan(null)}
          onPlanGenerated={handlePlanActivated}
        />
      )}
    </div>
  );
};


export default Dashboard;


