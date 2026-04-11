import axiosInstance from '../api/axios';

/**
 * Moderation Service
 * Handles resource reports and moderation actions
 * Admin-specific operations for managing inappropriate resources
 */
const moderationService = {
  // REPORTS
  /**
   * Create a report for inappropriate resource
   * Reasons: Inappropriate Content, Copyright Violation, Spam, Duplicate, Other
   * Rate limit: Part of general 100 actions/hour
   */
  createReport: async (resourceId, reason, description = '') => {
    try {
      const response = await axiosInstance.post('/moderation/report/', {
        resource: resourceId,
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create report' };
    }
  },

  /**
   * Get all reports (users see only their own, admins see all)
   * Query params: status (pending, resolved, closed), resource__status
   */
  getReports: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/moderation/report/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch reports' };
    }
  },

  /**
   * Get user's own reports only
   */
  getMyReports: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axiosInstance.get('/moderation/report/', { params });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch my reports' };
    }
  },

  /**
   * Get pending reports (ADMIN ONLY)
   */
  getPendingReports: async () => {
    try {
      const response = await axiosInstance.get('/moderation/report/', {
        params: { status: 'pending' },
      });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch pending reports' };
    }
  },

  /**
   * Get a specific report by ID
   */
  getReportById: async (reportId) => {
    try {
      const response = await axiosInstance.get(`/moderation/report/${reportId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch report' };
    }
  },

  /**
   * Update report status (ADMIN ONLY)
   * Status: pending, resolved, closed
   */
  updateReportStatus: async (reportId, status) => {
    try {
      const response = await axiosInstance.patch(`/moderation/report/${reportId}/`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update report' };
    }
  },

  // MODERATION ACTIONS
  /**
   * Create a moderation action (ADMIN ONLY)
   * Actions: approved, rejected
   */
  createModerationAction: async (resourceId, action, reason = '') => {
    try {
      const response = await axiosInstance.post('/moderation/action/', {
        resource: resourceId,
        action,
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create action' };
    }
  },

  /**
   * Approve a resource (ADMIN ONLY)
   * Short helper for common action
   */
  approveResource: async (resourceId, reason = 'Approved after review') => {
    return moderationService.createModerationAction(
      resourceId,
      'approved',
      reason
    );
  },

  /**
   * Reject a resource (ADMIN ONLY)
   * Short helper for common action
   */
  rejectResource: async (resourceId, reason = 'Rejected due to policy violation') => {
    return moderationService.createModerationAction(
      resourceId,
      'rejected',
      reason
    );
  },

  /**
   * Get all moderation actions (ADMIN ONLY)
   * Query params: action (approved, rejected), resource__status
   */
  getModerationActions: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/moderation/action/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch actions' };
    }
  },

  /**
   * Get approved actions only (ADMIN ONLY)
   */
  getApprovedActions: async () => {
    try {
      const response = await axiosInstance.get('/moderation/action/', {
        params: { action: 'approved' },
      });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch approved actions' };
    }
  },

  /**
   * Get rejected actions only (ADMIN ONLY)
   */
  getRejectedActions: async () => {
    try {
      const response = await axiosInstance.get('/moderation/action/', {
        params: { action: 'rejected' },
      });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch rejected actions' };
    }
  },

  /**
   * Get actions for a specific resource (ADMIN ONLY)
   */
  getResourceActions: async (resourceId) => {
    try {
      const allActions = await moderationService.getModerationActions();
      return allActions.results.filter((action) => action.resource === resourceId);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get action by ID (ADMIN ONLY)
   */
  getActionById: async (actionId) => {
    try {
      const response = await axiosInstance.get(`/moderation/action/${actionId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch action' };
    }
  },

  /**
   * Helper: Format report reason for display
   */
  formatReportReason: (reason) => {
    const reasonMap = {
      'Inappropriate Content': 'Contains inappropriate content',
      'Copyright Violation': 'Copyright or intellectual property violation',
      Spam: 'Spam or malicious content',
      Duplicate: 'Duplicate resource',
      Other: 'Other reason',
    };
    return reasonMap[reason] || reason;
  },

  /**
   * Helper: Format moderation action for display
   */
  formatAction: (action) => {
    return action === 'approved' ? '✓ Approved' : '✗ Rejected';
  },
};

export default moderationService;
