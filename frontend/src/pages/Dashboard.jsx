import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/schedule/FileUpload';
import ScheduleList from '../components/schedule/ScheduleList';
import PlanGenerator from '../components/plan/PlanGenerator';
import StatsGrid from '../components/dashboard/StatsGrid';
import AIChat from '../components/dashboard/AIChat';
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
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedScheduleForPlan, setSelectedScheduleForPlan] = useState(null);

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
      className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        isActive 
          ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
          : 'text-gray-400 hover:bg-white/5 border border-transparent'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0f0f12] flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FocusMind <span className="text-indigo-500">AI</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          <NavItem to="/dashboard" icon={Layout} label="Overview" end />
          <NavItem to="/dashboard/schedules" icon={FileText} label="Schedules" />
          <NavItem to="/dashboard/tasks" icon={CheckSquare} label="Daily Tasks" />
          <NavItem to="/dashboard/chat" icon={MessageSquare} label="AI Assistant" />
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavItem to="/dashboard/profile" icon={User} label="My Profile" />
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Authenticated</p>
            <p className="text-sm font-medium truncate text-gray-300">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-8 flex items-center justify-between sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-md z-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'schedules' && 'Study Schedules'}
              {activeTab === 'tasks' && 'Daily Focus'}
              {activeTab === 'chat' && 'AI Study Assistant'}
              {activeTab === 'profile' && 'User Profile'}
            </h1>
            <p className="text-gray-400 text-sm">
              {activeTab === 'overview' && 'Track your progress and AI insights.'}
              {activeTab === 'schedules' && 'Manage your uploaded school schedules.'}
              {activeTab === 'tasks' && 'Actionable tasks for your study plan.'}
              {activeTab === 'chat' && 'Chat with FocusMind AI to optimize your learning.'}
              {activeTab === 'profile' && 'Manage your account settings.'}
            </p>
          </div>
          
          {activeTab === 'schedules' && (
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg
                ${showUpload 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-500" />
                      Quick AI Assistant
                    </h2>
                    <AIChat />
                  </div>
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <p className="text-gray-500 text-sm text-center py-8 italic">No recent activity found.</p>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-6">Upcoming Deadlines</h2>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <p className="text-gray-500 text-sm text-center py-8 italic">No upcoming deadlines.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="schedules" element={
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {showUpload && (
                  <div className="mb-12">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Plus className="w-6 h-6 text-indigo-500" />
                        Upload New Schedule
                      </h2>
                      <FileUpload onUploadSuccess={handleUploadSuccess} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Schedules</h2>
                  <div className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {schedules.length} total
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-gray-400">Loading your data...</p>
                  </div>
                ) : (
                  <ScheduleList schedules={schedules} onGenerate={(s) => setSelectedScheduleForPlan(s)} />
                )}
              </div>
            } />

            <Route path="tasks" element={
              <div className="animate-in fade-in duration-500 py-20 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
                <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-400">Task Management coming soon</h2>
                <p className="text-gray-500 mt-2">Generate a study plan to see your daily tasks here.</p>
              </div>
            } />

            <Route path="chat" element={
              <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
                <AIChat />
              </div>
            } />
            
            <Route path="profile" element={
              <div className="animate-in fade-in duration-500 py-20 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
                <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-400">Profile Settings</h2>
                <p className="text-gray-500 mt-2">Personalize your study preferences.</p>
              </div>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {selectedScheduleForPlan && (
        <PlanGenerator 
          schedule={selectedScheduleForPlan} 
          onClose={() => setSelectedScheduleForPlan(null)}
          onPlanGenerated={(newPlan) => {
            console.log('Plan generated:', newPlan);
            // We could update global state here if needed
          }}
        />
      )}
    </div>
  );
};


export default Dashboard;


