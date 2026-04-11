import { useState, useEffect } from 'react';
import { AlertCircle, Check, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import AdminNavbar from '../components/AdminNavbar';
import moderationService from '../services/moderationService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function AdminReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'admin' && !user?.is_staff) return;
    fetchReports();
  }, [selectedStatus, page, user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (selectedStatus === 'pending') {
        response = await moderationService.getPendingReports();
      } else {
        response = await moderationService.getReports({ status: selectedStatus, page });
      }

      setReports(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId) => {
    try {
      setError(null);
      await moderationService.updateReportStatus(reportId, 'resolved');
      setSuccess('Report marked as resolved!');
      fetchReports();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update report');
      console.error(err);
    }
  };

  const handleClose = async (reportId) => {
    try {
      setError(null);
      await moderationService.updateReportStatus(reportId, 'closed');
      setSuccess('Report closed!');
      fetchReports();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to close report');
      console.error(err);
    }
  };

  const REASON_LABELS = {
    'inappropriate': 'Inappropriate Content',
    'copyright': 'Copyright Violation',
    'spam': 'Spam',
    'duplicate': 'Duplicate',
    'other': 'Other'
  };

  const totalPages = Math.ceil(totalCount / 10) || 1;

  const statusConfig = {
    pending: { activeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', inactiveClass: 'border-border text-muted-foreground hover:bg-secondary', label: 'Pending', icon: '⏳' },
    resolved: { activeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400', inactiveClass: 'border-border text-muted-foreground hover:bg-secondary', label: 'Resolved', icon: '✅' },
    closed: { activeClass: 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400', inactiveClass: 'border-border text-muted-foreground hover:bg-secondary', label: 'Closed', icon: '✔️' },
  };

  return (
    <MainLayout>
      <AdminNavbar />
      
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              🚨 Content Reports
            </h1>
            <p className="text-muted-foreground text-lg">Review and manage user-submitted reports. <span className="text-primary font-bold">{reports.length} items</span></p>
          </motion.div>

          {/* Status Filter */}
          <motion.div 
            className="flex gap-3 mb-8 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {['pending', 'resolved', 'closed'].map((status) => {
              const config = statusConfig[status];
              const isActive = selectedStatus === status;
              return (
                <motion.button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setPage(1);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 border-2 ${
                    isActive ? config.activeClass : config.inactiveClass
                  }`}
                >
                  <span>{config.icon}</span>
                  {config.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Alerts */}
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl mb-6 backdrop-blur-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reports List */}
          {loading ? (
            <motion.div 
              className="flex items-center justify-center h-64"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-muted mx-auto mb-3 animate-pulse" />
                <p className="text-muted-foreground font-medium">Loading reports...</p>
              </div>
            </motion.div>
          ) : reports.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border shadow-sm">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-foreground font-semibold text-lg">No reports found</p>
                <p className="text-muted-foreground text-sm mt-1">Great! No content issues to handle</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-2xl p-6 bg-card backdrop-blur-sm border shadow-sm hover:shadow-md transition-all group ${
                      report.status === 'pending'
                        ? 'border-amber-500/30 hover:border-amber-500/50'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Report Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-4xl drop-shadow-sm">
                            {report.status === 'pending' ? '🚨' : report.status === 'resolved' ? '✅' : '✔️'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              Report #{report.id}
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                              <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Reported by</p>
                                <p className="text-foreground font-bold text-sm truncate">{report.reported_by?.first_name || 'Anonymous'}</p>
                              </div>
                              <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Reason</p>
                                <p className="text-foreground font-bold text-sm truncate">{REASON_LABELS[report.reason] || report.reason}</p>
                              </div>
                              <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Resource ID</p>
                                <p className="text-foreground font-bold text-sm truncate">#{report.resource}</p>
                              </div>
                              <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Status</p>
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold mt-1 uppercase ${
                                  report.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                    : report.status === 'resolved'
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-slate-500/20 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {report.status}
                                </span>
                              </div>
                            </div>

                            <div className="bg-secondary/50 p-4 rounded-lg border border-border mb-4">
                              <p className="text-muted-foreground font-semibold text-xs mb-2 uppercase tracking-wider">📝 Description</p>
                              <p className="text-foreground text-sm leading-relaxed">{report.description}</p>
                            </div>

                            <p className="text-muted-foreground text-xs font-medium">
                              📅 {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {report.status === 'pending' && (
                        <div className="flex flex-row flex-wrap lg:flex-col gap-3 lg:w-36 shrink-0 mt-2 lg:mt-0">
                          <Button
                            variant="outline"
                            onClick={() => window.open(`/resources/${report.resource}`, '_blank')}
                            className="flex-1 lg:flex-none border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-2 h-10"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleResolve(report.id)}
                            className="flex-1 lg:flex-none border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-2 h-10"
                          >
                            <Check className="w-4 h-4" />
                            Resolve
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleClose(report.id)}
                            className="flex-1 lg:flex-none border-slate-500/20 hover:border-slate-500 hover:bg-slate-500/10 text-slate-600 dark:text-slate-400 gap-2 h-10"
                          >
                            <X className="w-4 h-4" />
                            Close
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              className="flex items-center justify-between mt-10 pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-sm text-muted-foreground font-medium">
                Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
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
        </div>
      </div>
    </MainLayout>
  );
}
