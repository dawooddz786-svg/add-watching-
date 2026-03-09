import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Wallet, 
  PlayCircle, 
  Users, 
  ArrowDownCircle, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  HeadphonesIcon,
  Home as HomeIcon
} from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { cn } from './lib/utils';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import Tasks from './pages/Tasks';
import Referrals from './pages/Referrals';
import Withdraw from './pages/Withdraw';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import LiveWithdrawals from './components/LiveWithdrawals';

const PrivateRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
      <PlayCircle className="text-white w-5 h-5" />
    </div>
    <span className="font-bold text-xl text-slate-900 tracking-tight">Ad Watching</span>
  </div>
);

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (o: boolean) => void }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: PlayCircle },
    { name: 'Deposit', path: '/deposit', icon: Wallet },
    { name: 'Withdraw', path: '/withdraw', icon: ArrowDownCircle },
    { name: 'Referrals', path: '/referrals', icon: Users },
    { name: 'Support', path: '/support', icon: HeadphonesIcon },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <Logo />
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                location.pathname === item.path 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Users className="w-5 h-5" />
            Switch Account
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token, user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Toaster position="top-center" />
        
        {token && (
          <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 lg:left-64">
            <div className="h-full px-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <Logo className="hidden sm:flex lg:hidden" />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Welcome Back</p>
                  <p className="text-sm font-black text-slate-900">{user?.name || 'User'}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>
        )}

        {token && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}

        <main className={cn(
          "transition-all duration-300 pb-14",
          token ? "pt-16 lg:pl-64" : ""
        )}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/deposit" element={<PrivateRoute><Deposit /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
            <Route path="/referrals" element={<PrivateRoute><Referrals /></PrivateRoute>} />
            <Route path="/withdraw" element={<PrivateRoute><Withdraw /></PrivateRoute>} />
            <Route path="/support" element={<PrivateRoute><Support /></PrivateRoute>} />
            
            <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <LiveWithdrawals />
      </div>
    </Router>
  );
}
