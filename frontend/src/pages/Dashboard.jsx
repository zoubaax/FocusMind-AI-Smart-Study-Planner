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
  LayoutDashboard, 
  LogOut, 
  User, 
  Plus, 
  Loader2, 
  X, 
  FileText, 
  CheckSquare, 
  MessageSquare,
  Sparkles,
  BookOpen,
  Clock,
  Coffee,
  PenTool,
  ArrowRight,
  Calendar,
  TrendingUp,
  Settings,
  HelpCircle,
  Bell,
  ChevronRight,
  Menu,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedScheduleForPlan, setSelectedScheduleForPlan] = useState(null);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) => `group flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-slate-100 text-slate-900' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${
        location.pathname === to ? 'text-slate-900' : 'text-slate-400'
      }`} />
      <span className="text-sm">{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:w-64 flex-col fixed inset-y-0 bg-white border-r border-slate-200">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Logo */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-slate-900">StudyFlow</span>
                  <span className="text-xs text-slate-500 block -mt-0.5">AI Planner</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" end />
              <NavItem to="/dashboard/schedules" icon={FileText} label="Schedules" />
              <NavItem to="/dashboard/tasks" icon={CheckSquare} label="Daily Tasks" />
              <NavItem to="/dashboard/chat" icon={MessageSquare} label="AI Assistant" />
              
              <div className="pt-4 mt-4 border-t border-slate-100">
                <NavItem to="/dashboard/profile" icon={User} label="Profile" />
                <NavItem to="/dashboard/settings" icon={Settings} label="Settings" />
                <NavItem to="/dashboard/help" icon={HelpCircle} label="Help" />
              </div>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-slate-500 mb-1">Signed in as</p>
                <p className="text-sm font-medium text-slate-700 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      {activeTab === 'overview' && 'Dashboard'}
                      {activeTab === 'schedules' && 'Study Schedules'}
                      {activeTab === 'tasks' && 'Daily Tasks'}
                      {activeTab === 'chat' && 'AI Assistant'}
                      {activeTab === 'profile' && 'Profile'}
                      {activeTab === 'settings' && 'Settings'}
                      {activeTab === 'help' && 'Help Center'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {activeTab === 'overview' && 'Welcome back! Here\'s your study overview'}
                      {activeTab === 'schedules' && 'Manage your uploaded study materials'}
                      {activeTab === 'tasks' && 'Track and complete your daily tasks'}
                      {activeTab === 'chat' && 'Get AI-powered study assistance'}
                      {activeTab === 'profile' && 'Manage your account information'}
                      {activeTab === 'settings' && 'Customize your experience'}
                      {activeTab === 'help' && 'Get help and support'}
                    </p>
                  </div>
                </div>
                
                {activeTab === 'schedules' && (
                  <button 
                    onClick={() => setShowUpload(!showUpload)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      showUpload 
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                    }`}
                  >
                    {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showUpload ? 'Cancel' : 'Upload Schedule'}
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6">
            <Routes>
              <Route index element={
                <div className="space-y-6">
                  <StatsGrid />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-slate-400" />
                            AI Assistant
                          </h2>
                          <span className="text-xs text-slate-400">Powered by AI</span>
                        </div>
                        <AIChat />
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-slate-400" />
                            Today's Tasks
                          </h2>
                          <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                            View all
                          </button>
                        </div>
                        <TaskList key={taskRefreshKey} />
                      </div>
                    </div>
                  </div>
                </div>
              } />

              <Route path="schedules" element={
                <div className="space-y-6">
                  {showUpload && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Upload New Schedule
                      </h2>
                      <FileUpload onUploadSuccess={handleUploadSuccess} />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-slate-900">Your Schedules</h2>
                      <div className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {schedules.length} total
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                      </div>
                    ) : (
                      <ScheduleList 
                        schedules={schedules} 
                        onGenerate={(s) => setSelectedScheduleForPlan(s)} 
                        onDelete={async (schedule) => {
                          await scheduleService.delete(schedule.id);
                          fetchSchedules();
                        }}
                        onShare={(schedule) => {
                          // Share functionality
                          navigator.share?.({
                            title: schedule.fileName,
                            url: schedule.fileUrl
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
              } />

              <Route path="tasks" element={
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <TaskList key={taskRefreshKey} isFullPage={true} />
                </div>
              } />

              <Route path="chat" element={
                <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-4xl mx-auto">
                  <AIChat />
                </div>
              } />
              
              <Route path="profile" element={
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">{user?.email}</h2>
                    <p className="text-slate-500 text-sm mb-6">Member since {new Date().toLocaleDateString()}</p>
                    
                    <div className="text-left border-t border-slate-100 pt-6">
                      <h3 className="font-medium text-slate-900 mb-4">Account Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Email</span>
                          <span className="text-slate-700">{user?.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-500">Plan</span>
                          <span className="text-slate-700 font-medium">Free</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              } />

              <Route path="settings" element={
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Settings</h2>
                    <p className="text-slate-500 text-sm">Settings panel coming soon</p>
                  </div>
                </div>
              } />

              <Route path="help" element={
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Help Center</h2>
                    <p className="text-slate-500 text-sm">Help content coming soon</p>
                  </div>
                </div>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Plan Generator Modal */}
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