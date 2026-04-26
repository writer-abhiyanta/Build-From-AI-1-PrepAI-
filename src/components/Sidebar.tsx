import { Briefcase, FileText, LayoutDashboard, MessageSquare, Code, LogOut, User as UserIcon, Image as ImageIcon, MessageCircle, Sparkles, Kanban } from 'lucide-react';
import { User } from 'firebase/auth';
import { logout } from '../lib/firebase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  role: string | null;
}

export function Sidebar({ activeTab, setActiveTab, user, role }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'chat', label: 'AI Mentor', icon: MessageCircle, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'interview', label: 'Interview Practice', icon: MessageSquare, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'tracker', label: 'Placement Tracker', icon: Kanban, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'analyzer', label: 'Resume Analyzer', icon: FileText, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'builder', label: 'Resume Builder', icon: Briefcase, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'project', label: 'Project Builder', icon: Code, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'tools', label: 'Career Suite', icon: Sparkles, roles: ['student', 'mentor', 'admin', 'employee'] },
    { id: 'report', label: 'Build Report', icon: FileText, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => !role || item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
          <Briefcase className="w-6 h-6" />
          PrepAI
        </h1>
        <p className="text-sm text-gray-500 mt-1">Student Placement & Training</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-emerald-100" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  role === 'admin' ? 'bg-red-100 text-red-700' : 
                  role === 'mentor' ? 'bg-blue-100 text-blue-700' : 
                  role === 'employee' ? 'bg-teal-100 text-teal-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {role || 'student'}
                </span>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <h3 className="font-bold text-sm">Pro Features</h3>
          <p className="text-xs text-emerald-50 mt-1 opacity-90">Unlock advanced AI capabilities</p>
          <button className="mt-4 w-full bg-white text-emerald-700 text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-50 transition-colors">
            Upgrade Now
          </button>
        </div>

        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
