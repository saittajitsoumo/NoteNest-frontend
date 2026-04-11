import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  FileText,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import AdminNavbar from '../components/AdminNavbar';
import resourceService from '../services/resourceService';
import moderationService from '../services/moderationService';
import userService from '../services/userService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingResources: 0,
    approvedResources: 0,
    rejectedResources: 0,
    pendingReports: 0,
    totalUsers: 0,
    totalResources: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin' && !user?.is_staff) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const resourcesResponse = await resourceService.getAll({ page_size: 1 });
      const pendingResponse = await resourceService.getPending();
      const approvedResponse = await resourceService.getApproved();
      const rejectedResponse = await resourceService.getRejected();
      const reportsResponse = await moderationService.getPendingReports();
      const usersResponse = await userService.getStats();

      setStats({
        pendingResources: pendingResponse.count || 0,
        approvedResources: approvedResponse.count || 0,
        rejectedResources: rejectedResponse.count || 0,
        pendingReports: reportsResponse.count || 0,
        totalResources: resourcesResponse.count || 0,
        totalUsers: usersResponse.total || 0,
      });
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer border border-border bg-card/60 backdrop-blur-md shadow-sm transition-all group ${color}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-start justify-between z-10">
        <div className="flex-1">
          <motion.p 
            className="text-muted-foreground text-sm font-semibold mb-1 uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {title}
          </motion.p>
          <motion.div 
            className="flex items-baseline gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-4xl font-extrabold text-foreground tracking-tight">{loading ? '–' : value}</p>
            {trend && <span className="text-emerald-500 font-semibold text-sm">↑ {trend}%</span>}
          </motion.div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="p-3.5 rounded-2xl bg-foreground/5 text-foreground group-hover:bg-foreground/10 transition-colors"
        >
          <Icon className="w-7 h-7 opacity-80" />
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );

  return (
    <MainLayout>
      <AdminNavbar />
      
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 md:mb-12"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">Welcome back, <span className="text-primary font-bold">{user?.first_name || user?.username}</span>! Here's your system status.</p>
              </div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="text-5xl md:text-6xl hidden sm:block drop-shadow-md"
              >
                👑
              </motion.div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl mb-8 flex items-center gap-3 backdrop-blur-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <StatCard
                icon={Clock}
                title="Pending Approval"
                value={stats.pendingResources}
                color="group-hover:border-amber-500/50 hover:shadow-amber-500/10"
                onClick={() => navigate('/admin/moderation')}
                trend={Math.round(Math.random() * 20)}
              />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <StatCard
                icon={CheckCircle}
                title="Approved Resources"
                value={stats.approvedResources}
                color="group-hover:border-emerald-500/50 hover:shadow-emerald-500/10"
                onClick={() => navigate('/admin/moderation?status=approved')}
                trend={Math.round(Math.random() * 30)}
              />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <StatCard
                icon={AlertCircle}
                title="Pending Reports"
                value={stats.pendingReports}
                color="group-hover:border-rose-500/50 hover:shadow-rose-500/10"
                onClick={() => navigate('/admin/reports')}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <StatCard
                icon={FileText}
                title="Total Resources"
                value={stats.totalResources}
                color="group-hover:border-blue-500/50 hover:shadow-blue-500/10"
                onClick={() => navigate('/admin/moderation')}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers}
                color="group-hover:border-indigo-500/50 hover:shadow-indigo-500/10"
                onClick={() => navigate('/admin/users')}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <StatCard
                icon={AlertCircle}
                title="Rejected Resources"
                value={stats.rejectedResources}
                color="group-hover:border-slate-500/50 hover:shadow-slate-500/10"
                onClick={() => navigate('/admin/moderation?status=rejected')}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <StatCard
                icon={TrendingUp}
                title="Academic Setup"
                value="Manage"
                color="group-hover:border-purple-500/50 hover:shadow-purple-500/10"
                onClick={() => navigate('/admin/academic')}
              />
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold tracking-tight mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  title: 'Review Pending Resources',
                  desc: `${stats.pendingResources} awaiting approval`,
                  icon: '📋',
                  borderColor: 'hover:border-blue-500/50',
                  action: () => navigate('/admin/moderation'),
                },
                {
                  title: 'Review User Reports',
                  desc: `${stats.pendingReports} pending reports`,
                  icon: '🚨',
                  borderColor: 'hover:border-rose-500/50',
                  action: () => navigate('/admin/reports'),
                },
                {
                  title: 'Manage Academic Data',
                  desc: 'Departments, Courses, Semesters',
                  icon: '📚',
                  borderColor: 'hover:border-purple-500/50',
                  action: () => navigate('/admin/academic'),
                },
                {
                  title: 'User Management',
                  desc: 'View and manage registered users',
                  icon: '👥',
                  borderColor: 'hover:border-emerald-500/50',
                  action: () => navigate('/admin/users'),
                },
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  onClick={action.action}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className={`group relative overflow-hidden rounded-2xl p-6 bg-card/50 backdrop-blur-sm border border-border text-left transition-all shadow-sm hover:shadow-md ${action.borderColor}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/0 via-foreground/5 to-foreground/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-start justify-between mb-3">
                    <div className="text-4xl drop-shadow-sm">{action.icon}</div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-1">{action.title}</h3>
                  <p className="text-muted-foreground text-sm font-medium">{action.desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
