import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, X, Eye, Download, FileText, Filter, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import AdminNavbar from '../components/AdminNavbar';
import resourceService from '../services/resourceService';
import axiosInstance from '../api/axios'; // Import axios instance for actions fetch
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function AdminModeration() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin' && !user?.is_staff) return;
    fetchResources();
  }, [selectedStatus, page, user]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      let actions = [];
      
      if (selectedStatus === 'pending') {
        const [resResponse, actionsResponse] = await Promise.all([
          resourceService.getPending(),
          axiosInstance.get('/moderation/action/', { params: { resource__status: 'pending' } })
        ]);
        response = resResponse;
        actions = actionsResponse.data.results || [];
      } else if (selectedStatus === 'approved') {
        response = await resourceService.getApproved();
      } else if (selectedStatus === 'rejected') {
        response = await resourceService.getRejected();
      } else {
        response = await resourceService.getAll({ status: selectedStatus });
      }

      const fetchedResources = response.results || [];
      const filteredResources = fetchedResources.filter(r => r.status === selectedStatus);
      
      // Link actionId to resources
      const resourcesWithActions = filteredResources.map(resource => {
        const action = actions.find(a => 
          (a.resource === resource.id) || (a.resource?.id === resource.id)
        );
        return { ...resource, actionId: action?.id };
      });
      
      setResources(resourcesWithActions);
      setTotalPages(Math.ceil(filteredResources.length / 10) || 1);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resourceId, actionId) => {
    try {
      setError(null);
      setActioningId(resourceId);
      
      await resourceService.approve(resourceId, actionId);
      
      setResources(prev => prev.filter(r => r.id !== resourceId));
      
      setSuccess('✅ Resource approved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err?.error || err?.message || 'Failed to approve resource';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (resourceId, actionId) => {
    try {
      setError(null);
      setActioningId(resourceId);
      
      await resourceService.reject(resourceId, actionId);
      
      setResources(prev => prev.filter(r => r.id !== resourceId));
      
      setSuccess('❌ Resource rejected successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err?.error || err?.message || 'Failed to reject resource';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }
    try {
      setError(null);
      setActioningId(resourceId);
      
      await resourceService.deleteResource(resourceId);
      
      setResources(prev => prev.filter(r => r.id !== resourceId));
      
      setSuccess('🗑️ Resource deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err?.error || err?.message || 'Failed to delete resource';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActioningId(null);
    }
  };

  const statusConfig = {
    pending: { activeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', inactiveClass: 'border-border text-muted-foreground hover:bg-secondary', text: 'Pending Review', icon: '⏳' },
    approved: { activeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400', inactiveClass: 'border-border text-muted-foreground hover:bg-secondary', text: 'Approved', icon: '✅' },
    rejected: { activeClass: 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400', inactiveClass: 'border-border text-muted-foreground hover:bg-secondary', text: 'Rejected', icon: '❌' },
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
              📋 Resource Moderation
            </h1>
            <p className="text-muted-foreground text-lg">Review and approve/reject uploaded resources. Total: <span className="text-primary font-bold">{resources.length}</span></p>
          </motion.div>

          {/* Status Filter */}
          <motion.div 
            className="flex gap-3 mb-8 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {['pending', 'approved', 'rejected'].map((status) => {
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
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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

          {/* Resources List */}
          {loading ? (
            <motion.div 
              className="flex items-center justify-center h-64"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-center">
                <Zap className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Loading resources...</p>
              </div>
            </motion.div>
          ) : resources.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border shadow-sm">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-foreground font-semibold text-lg">No resources found</p>
                <p className="text-muted-foreground text-sm mt-1">Check back later for new submissions</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {resources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Resource Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-4xl drop-shadow-sm">📄</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-1">{resource.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3 max-w-3xl line-clamp-2">{resource.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Uploaded by</p>
                            <p className="text-foreground font-bold text-sm truncate">{resource.uploaded_by?.first_name || 'Unknown'}</p>
                          </div>
                          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Type</p>
                            <p className="text-foreground font-bold text-sm capitalize truncate">{resource.resource_type}</p>
                          </div>
                          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Department</p>
                            <p className="text-foreground font-bold text-sm truncate">{resource.department?.name || '–'}</p>
                          </div>
                          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Course</p>
                            <p className="text-foreground font-bold text-sm truncate">{resource.course?.course_code || resource.course?.title || '–'}</p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-sm text-muted-foreground font-medium flex-wrap">
                          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-blue-500"/>{resource.view_count} views</span>
                          <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-emerald-500"/>{resource.download_count} downloads</span>
                          <span className="flex items-center gap-1.5"><span className="text-rose-500">❤️</span>{resource.likes_count} likes</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row flex-wrap lg:flex-col gap-3 lg:w-36 shrink-0 mt-2 lg:mt-0">
                        <Button
                          variant="outline"
                          onClick={() => window.open(resource.file, '_blank')}
                          className="flex-1 lg:flex-none border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-2 h-10"
                        >
                          <Eye className="w-4 h-4" />
                          View File
                        </Button>

                        {selectedStatus === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleApprove(resource.id, resource.actionId)}
                              disabled={actioningId === resource.id}
                              className="flex-1 lg:flex-none border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-2 h-10"
                            >
                              <Check className="w-4 h-4" />
                              {actioningId === resource.id ? 'Approving...' : 'Approve'}
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => handleReject(resource.id, resource.actionId)}
                              disabled={actioningId === resource.id}
                              className="flex-1 lg:flex-none border-amber-500/20 hover:border-amber-500 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-2 h-10"
                            >
                              <X className="w-4 h-4" />
                              {actioningId === resource.id ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(resource.id)}
                          disabled={actioningId === resource.id}
                          className="flex-1 lg:flex-none border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-destructive gap-2 h-10"
                        >
                          <Trash2 className="w-4 h-4" />
                          {actioningId === resource.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
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
