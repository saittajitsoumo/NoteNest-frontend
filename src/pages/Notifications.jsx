import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, Trash2, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import notificationService from '../services/notificationService';
import { formatTimeAgo, getNotificationIcon } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = filterUnread ? { is_read: false } : {};
        const response = await notificationService.getPage(1, params);
        
        // Filter out self-notifications (e.g. actions by the user themselves)
        const filtered = (response.notifications || []).filter(n => {
          const lowerMsg = n.message?.toLowerCase() || '';
          return !lowerMsg.startsWith('you ');
        });

        setNotifications(filtered);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [isAuthenticated, navigate, filterUnread]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.delete(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNavigate = (notification) => {
    if (notification.link_type === 'resource' && notification.link_id) {
      navigate(`/resources/${notification.link_id}`);
    } else if (notification.link_type === 'comment' && notification.link_id) {
      navigate(`/resources/${notification.link_id}#comments`);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Notifications</h1>
            </div>
            <p className="text-muted-foreground ml-[60px]">
              You have <span className="font-bold text-foreground">{unreadCount}</span> unread notification
              {unreadCount !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex gap-2 ml-[60px]"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterUnread(!filterUnread)}
              className={`px-5 py-2.5 rounded-xl font-bold transition shadow-sm border ${
                filterUnread
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:border-primary/50'
              }`}
            >
              {filterUnread ? 'Unread Only' : 'All Notifications'}
            </motion.button>
          </motion.div>

          {/* Content */}
          <div className="ml-0 md:ml-[60px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 bg-card border border-border rounded-2xl">
                <div className="flex flex-col items-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-3 border-muted border-t-primary rounded-full mb-4" />
                  <p className="text-muted-foreground font-medium">Loading notifications...</p>
                </div>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-6 bg-destructive/10 border border-destructive/20 rounded-2xl"
              >
                <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                <p className="text-sm font-semibold text-destructive">{error}</p>
              </motion.div>
            ) : notifications.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {notifications.map((notification, idx) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                    className={`p-5 rounded-2xl border-l-[6px] shadow-sm transition cursor-pointer ${
                      notification.is_read
                        ? 'bg-card border-border border-l-transparent hover:border-l-primary/30'
                        : 'bg-primary/5 border-primary/20 border-l-primary hover:bg-primary/10'
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        handleMarkAsRead(notification.id);
                      }
                      handleNavigate(notification);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl drop-shadow-sm">{getNotificationIcon(notification.title)}</span>
                          <h3 className={`font-bold truncate ${notification.is_read ? 'text-foreground' : 'text-primary'}`}>{notification.title}</h3>
                          {!notification.is_read && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-3 pl-9 leading-relaxed ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium pl-9">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!notification.is_read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            title="Mark as read"
                            className="p-2.5 bg-background border border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted-foreground rounded-xl transition shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          title="Delete"
                          className="p-2.5 bg-background border border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground rounded-xl transition shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm"
              >
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                  <Bell className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Notifications</h3>
                <p className="text-muted-foreground">
                  {filterUnread ? 'You have no unread notes or updates.' : 'When you get activities, they will show up here.'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
