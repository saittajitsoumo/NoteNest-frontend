import { useState, useEffect } from 'react';
import { Search, Users, CheckCircle, Clock, Crown, Zap, Shield, Mail, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import AdminNavbar from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import userService from '../services/userService';
import { Button } from '../components/ui/Button';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    admins: 0,
  });

  useEffect(() => {
    if (!user) return; // Wait until user is loaded
    if (user?.role !== 'admin' && !user?.is_staff) return;
    fetchUsers();
  }, [user, page]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(
          u =>
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Update stats
    setStats({
      total: totalCount || users.length,
      verified: users.filter(u => u.is_verified).length,
      pending: users.filter(u => !u.is_verified).length,
      admins: users.filter(u => u.is_staff || u.role === 'admin').length,
    });
  }, [searchQuery, users, totalCount]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await userService.getAll({ page, page_size: 20 });

      const results = data.results || data || [];
      setUsers(results);
      setTotalCount(data.count || results.length);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please check your permissions or network connection.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / 20) || 1;

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.total, iconColor: 'text-blue-500', bgColor: 'bg-blue-500/10 dark:bg-blue-500/15', borderColor: 'border-blue-500/20' },
    { icon: CheckCircle, label: 'Verified', value: stats.verified, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/15', borderColor: 'border-emerald-500/20' },
    { icon: Clock, label: 'Pending', value: stats.pending, iconColor: 'text-amber-500', bgColor: 'bg-amber-500/10 dark:bg-amber-500/15', borderColor: 'border-amber-500/20' },
    { icon: Crown, label: 'Admins', value: stats.admins, iconColor: 'text-violet-500', bgColor: 'bg-violet-500/10 dark:bg-violet-500/15', borderColor: 'border-violet-500/20' },
  ];

  return (
    <MainLayout>
      <AdminNavbar />
      
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                👥 User Management
              </h1>
              <p className="text-muted-foreground text-lg">
                View all registered users and manage accounts
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className={`rounded-2xl p-5 border ${stat.borderColor} ${stat.bgColor} shadow-sm hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</p>
                      <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-card border border-border text-foreground placeholder-muted-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition shadow-sm"
              />
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl mb-6 backdrop-blur-sm"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users Table / Cards */}
          {loading ? (
            <motion.div 
              className="flex items-center justify-center h-64"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-center">
                <Zap className="w-12 h-12 text-muted mx-auto mb-3 animate-pulse" />
                <p className="text-muted-foreground font-medium">Loading users...</p>
              </div>
            </motion.div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border shadow-sm">
              <div className="text-center">
                <Users className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-foreground font-semibold text-lg">{searchQuery ? 'No users found' : 'No users available'}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'Users will appear here once they register'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden md:block rounded-2xl overflow-hidden border border-border shadow-sm bg-card"
              >
                <table className="w-full">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((u, index) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-background">
                              {(u.first_name || u.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-foreground font-semibold text-sm">
                                {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username}
                              </p>
                              <p className="text-muted-foreground text-xs">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="break-all">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.is_verified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20">
                              <CheckCircle className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {u.is_staff || u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg text-xs font-semibold border border-violet-500/20">
                              <Shield className="w-3.5 h-3.5" /> Admin
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs font-medium">Member</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-muted-foreground text-sm font-medium">
                            {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '–'}
                          </p>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredUsers.map((u, index) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-background shrink-0">
                          {(u.first_name || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground font-bold truncate">
                            {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username}
                          </p>
                          <p className="text-muted-foreground text-xs">@{u.username}</p>
                        </div>
                      </div>
                      {(u.is_staff || u.role === 'admin') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-md text-[10px] font-bold border border-violet-500/20">
                          <Crown className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="break-all">{u.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {u.is_verified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs font-medium">
                        {u.date_joined ? `Joined ${new Date(u.date_joined).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  className="flex items-center justify-between mt-10 pt-6 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-sm text-muted-foreground font-medium">
                    Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                    <span className="ml-2 text-xs">({totalCount} users total)</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
