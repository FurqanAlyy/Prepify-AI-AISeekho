import React from 'react';
import { User } from 'firebase/auth';
import { 
  BarChart2, 
  BookOpen, 
  Briefcase, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  PenTool, 
  Search, 
  X 
} from 'lucide-react';

interface LayoutProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, activeTab, setActiveTab, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Analysis Lab', icon: BarChart2 },
    { id: 'prep', label: 'Mock Interviews', icon: BookOpen },
    { id: 'plan', label: 'Prep Plans', icon: Briefcase },
    { id: 'optimizer', label: 'ATS Optimizer', icon: PenTool },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex font-sans text-slate-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-[#0D0D0D] border-r border-white/5 flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">
              P
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">Prepify AI</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-white/5 text-indigo-400 font-medium' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 bg-[#0D0D0D]">
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">AI Engine</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
              <span className="text-xs font-medium text-emerald-500 uppercase tracking-tighter">System Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-white/10"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-[#0D0D0D] border-b border-white/5 p-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Prepify AI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed inset-y-0 right-0 w-72 bg-[#0D0D0D] flex flex-col p-6 shadow-2xl border-l border-white/5">
              <div className="flex justify-between items-center mb-8">
                <span className="font-semibold text-lg text-white">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400"><X className="w-6 h-6" /></button>
              </div>
              <nav className="space-y-1 flex-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl ${
                      activeTab === item.id 
                        ? 'bg-white/5 text-indigo-400 font-medium' 
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-4 text-slate-400 border-t border-white/5"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  );
};
