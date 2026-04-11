import axiosInstance from '../api/axios';

/**
 * User Service
 * Handles all user-related API calls for administration
 */
const userService = {
  /**
   * Get all users with pagination and filters
   * GET /api/accounts/users/
   */
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/accounts/users/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch users' };
    }
  },

  /**
   * Get user statistics
   * This might involve fetching all users and calculating or using a dedicated stats endpoint if available
   */
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/accounts/users/', { params: { page_size: 1 } });
      // If the backend returns a 'count' field in the paginated response
      return {
        total: response.data.count || 0,
      };
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch user stats' };
    }
  },

  /**
   * Toggle user active status (Admin Only)
   */
  toggleStatus: async (userId, isActive) => {
    try {
      const response = await axiosInstance.patch(`/accounts/users/${userId}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update user status' };
    }
  }
};

export default userService;
