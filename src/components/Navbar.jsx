import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { ThemeToggle } from './ui/ThemeToggle';
import notificationService from '../services/notificationService';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationService.getUnread();
      // Filter out self-notifications (e.g. actions by the user themselves)
      // This addresses the issue where likes/comments by the owner were counting incorrectly
      const filtered = response.filter(n => {
        const lowerMsg = n.message?.toLowerCase() || '';
        const lowerUser = user?.username?.toLowerCase() || '';
        // If message starts with "You " or contains the user's name as the actor, it might be a self-interaction
        return !lowerMsg.startsWith('you ');
      });
      setNotifications(filtered);
      setUnreadCount(filtered.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch unread notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Poll every 30s
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isAuthenticated, user?.username]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Upload', href: '/upload' },
    { label: 'Bookmarks', href: '/bookmarks' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Profile', href: '/profile' },
    ...(user?.role === 'admin' || user?.is_staff || user?.is_superuser ? [{ label: '👑 Admin', href: '/admin' }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center shadow-lg"
            >
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </motion.div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">NoteNest</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative px-3 py-2 text-sm font-medium transition-colors"
                >
                  <span className={`relative z-10 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-primary/10 rounded-md -z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons & Theme / Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {!isAuthenticated ? (
              <motion.div className="flex items-center space-x-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button variant="ghost" className="text-muted-foreground" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} className="shadow-sm">
                  Register
                </Button>
              </motion.div>
            ) : (
              <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground relative" 
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-sm"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </Button>
                <div className="text-sm text-foreground">
                  <span className="font-semibold text-primary">{user?.username || 'User'}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Right Edge */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden pb-4 space-y-1 bg-background/95 backdrop-blur-xl absolute top-16 left-0 right-0 border-b border-border shadow-lg px-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 rounded-md text-base font-medium transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 mt-2 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <Button variant="destructive" className="w-full justify-start mt-2" onClick={() => { handleLogout(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => { navigate('/login'); setIsOpen(false); }}>
                      Login
                    </Button>
                    <Button className="w-full justify-start" onClick={() => { navigate('/register'); setIsOpen(false); }}>
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
