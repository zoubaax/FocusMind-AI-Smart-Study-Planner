import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/FormElements';
import { LogOut, User, Layout, Calendar, CheckSquare, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: <Layout className="w-5 h-5" />, label: 'Overview', active: true },
    { icon: <Calendar className="w-5 h-5" />, label: 'Study Plan' },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Tasks' },
    { icon: <BarChart2 className="w-5 h-5" />, label: 'Progress' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">F</div>
            <span className="font-bold text-xl text-slate-900">FocusMind</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${item.active 
                    ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <User className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">
                {user?.email.split('@')[0]}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.email}!</h1>
          <p className="text-slate-500 mt-2">Here's what's happening with your study goals today.</p>
        </header>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Study Plan Yet</h3>
            <p className="text-slate-500 mt-2 mb-6">Upload your schedule to generate an AI-powered plan.</p>
            <Button>Upload Schedule</Button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Quick Stats</h3>
            <div className="space-y-6">
              {[
                { label: 'Completed Tasks', value: '0/0', color: 'bg-green-100 text-green-600' },
                { label: 'Study Hours', value: '0h', color: 'bg-blue-100 text-blue-600' },
                { label: 'Current Streak', value: '0 days', color: 'bg-orange-100 text-orange-600' },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-600">{stat.label}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
