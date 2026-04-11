import axiosInstance from '../api/axios';

/**
 * Notification Service
 * Handles notifications for likes, comments, approvals, and rejections
 * Notification types:
 * 1. Resource Approval/Rejection - When moderators review your uploads
 * 2. Comment Replies - When someone replies to your comment
 * 3. Resource Likes - When someone likes your resource
 */
const notificationService = {
  /**
   * Get all notifications
   * Supports filtering by: is_read, ordering
   * Rate limit: 200 requests/hour per user
   */
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/notifications/', { params });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch notifications' };
    }
  },

  /**
   * Get unread notifications only
   */
  getUnread: async () => {
    try {
      const response = await axiosInstance.get('/notifications/', {
        params: { is_read: false, ordering: '-created_at' },
      });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch unread' };
    }
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications/', {
        params: { is_read: false },
      });
      return response.data.count || 0;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get count' };
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.patch(
        `/notifications/${notificationId}/mark_as_read/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to mark as read' };
    }
  },

  /**
   * Delete notification
   */
  delete: async (notificationId) => {
    try {
      const response = await axiosInstance.delete(
        `/notifications/${notificationId}/delete_notification/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete notification' };
    }
  },

  /**
   * Get paginated notifications
   */
  getPage: async (page = 1, params = {}) => {
    try {
      const response = await axiosInstance.get('/notifications/', {
        params: { page, ...params },
      });
      return {
        notifications: response.data.results,
        total: response.data.count,
        hasNext: response.data.next !== null,
        nextUrl: response.data.next,
      };
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch page' };
    }
  },

  /**
   * Start polling for notifications (client-side)
   * Polls every 30 seconds for new unread notifications
   */
  startPolling: (callback, interval = 30000) => {
    const poll = async () => {
      try {
        const unread = await notificationService.getUnread();
        callback(unread);
      } catch (error) {
        console.error('Notification poll error:', error);
      }
    };

    // Initial call
    poll();

    // Set up interval
    return setInterval(poll, interval);
  },

  /**
   * Stop polling for notifications
   */
  stopPolling: (intervalId) => {
    clearInterval(intervalId);
  },
};

/**
 * Moderation Service (Admin/Moderator endpoints)
 */
export const moderationService = {
  /**
   * Get resources pending moderation
   */
  getPendingResources: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/moderation/action/', {
        params: { resource__status: 'pending', ...params },
      });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch pending resources' };
    }
  },

  /**
   * Approve a resource
   */
  approveResource: async (actionId) => {
    try {
      const response = await axiosInstance.patch(`/moderation/action/${actionId}/`, {
        action: 'approved',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to approve resource' };
    }
  },

  /**
   * Reject a resource
   */
  rejectResource: async (actionId) => {
    try {
      const response = await axiosInstance.patch(`/moderation/action/${actionId}/`, {
        action: 'rejected',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to reject resource' };
    }
  },

  /**
   * Report/flag content
   */
  reportContent: async (resourceId, reason, description) => {
    try {
      const response = await axiosInstance.post('/moderation/report/', {
        resource: resourceId,
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to report content' };
    }
  },
};

export default notificationService;
