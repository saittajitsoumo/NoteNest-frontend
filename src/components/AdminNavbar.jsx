import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutGrid, CheckSquare, AlertCircle, BookOpen, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ui/ThemeToggle';

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: LayoutGrid, label: 'Dashboard' },
    { path: '/admin/moderation', icon: CheckSquare, label: 'Moderation' },
    { path: '/admin/reports', icon: AlertCircle, label: 'Reports' },
    { path: '/admin/academic', icon: BookOpen, label: 'Academic' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ];

  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path + '/'));

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-foreground font-bold hidden sm:inline tracking-tight text-lg">AdminPortal</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all font-medium ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth and Settings */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-border"></div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>

          {/* Mobile Right Edge */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-1 pt-2 border-t border-border mt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        active
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-base">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-xl transition font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
