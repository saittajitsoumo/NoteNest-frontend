import axiosInstance from '../api/axios';

/**
 * Interaction Service
 * Handles likes, comments, and bookmarks
 */
const interactionService = {
  // LIKES
  /**
   * Create a like on a resource
   * Rate limit: 100 likes/hour per user
   * Triggers notification to resource uploader
   */
  like: async (resourceId) => {
    try {
      console.log('❤️ Interactions - Creating like for resource:', resourceId);
      const response = await axiosInstance.post('/interactions/like/', {
        resource: resourceId,
      });
      console.log('❤️ Interactions - Like created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Like error:', error);
      throw error.response?.data || { error: 'Failed to like resource' };
    }
  },

  /**
   * Remove a like
   */
  unlike: async (likeId) => {
    try {
      console.log('🖤 Interactions - Deleting like:', likeId);
      const response = await axiosInstance.delete(`/interactions/like/${likeId}/`);
      console.log('🖤 Interactions - Like deleted');
      return response.data;
    } catch (error) {
      console.error('❌ Unlike error:', error);
      throw error.response?.data || { error: 'Failed to unlike resource' };
    }
  },

  /**
   * Get all likes for a resource
   * Returns paginated list of likes with user details
   */
  getLikes: async (resourceId, params = {}) => {
    try {
      console.log('❤️ Interactions - Fetching likes for resource:', resourceId);
      const response = await axiosInstance.get('/interactions/like/', {
        params: { resource: resourceId, ...params },
      });
      console.log(`❤️ Interactions - Found ${response.data.count} likes`);
      return response.data;
    } catch (error) {
      console.error('❌ Get likes error:', error);
      throw error.response?.data || { error: 'Failed to fetch likes' };
    }
  },

  /**
   * Get likes count for a resource (helper)
   */
  getLikesCount: async (resourceId) => {
    try {
      const response = await axiosInstance.get('/interactions/like/', {
        params: { resource: resourceId, page_size: 1 },
      });
      return response.data.count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Check if current user has liked a resource (helper)
   */
  hasUserLiked: async (resourceId) => {
    try {
      const response = await axiosInstance.get('/interactions/like/', {
        params: { resource: resourceId },
      });
      return response.data.results && response.data.results.length > 0;
    } catch (error) {
      return false;
    }
  },

  // COMMENTS
  /**
   * Get all comments with optional filtering
   * Supports resource, parent, and other filters
   */
  getAllComments: async (params = {}) => {
    try {
      console.log('💬 Interactions - Fetching all comments with params:', params);
      const response = await axiosInstance.get('/interactions/comment/', { params });
      console.log(`💬 Interactions - Found ${response.data.count} comments`);
      return response.data;
    } catch (error) {
      console.error('❌ Get comments error:', error);
      throw error.response?.data || { error: 'Failed to fetch comments' };
    }
  },

  /**
   * Get comments paginated
   */
  getCommentsPage: async (page = 1, pageSize = 10, filters = {}) => {
    try {
      console.log(`💬 Interactions - Fetching page ${page} with filters:`, filters);
      const response = await axiosInstance.get('/interactions/comment/', {
        params: { page, page_size: pageSize, ...filters },
      });
      console.log(`💬 Interactions - Page ${page}: ${response.data.results.length} comments, total: ${response.data.count}`);
      return {
        comments: response.data.results,
        total: response.data.count,
        hasNext: response.data.next !== null,
        hasPrevious: response.data.previous !== null,
        nextUrl: response.data.next,
        previousUrl: response.data.previous,
      };
    } catch (error) {
      console.error('❌ Get comments page error:', error);
      throw error.response?.data || { error: 'Failed to fetch comments' };
    }
  },

  /**
   * Get comment by ID
   */
  getComment: async (commentId) => {
    try {
      console.log('💬 Interactions - Fetching comment:', commentId);
      const response = await axiosInstance.get(
        `/interactions/comment/${commentId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch comment' };
    }
  },

  /**
   * Create a comment
   * Max length: 5000 characters
   * HTML characters auto-escaped
   * Parent can be set for replies
   * Rate limit: 100 comments/hour per user
   * Triggers notification to resource uploader or comment author (for replies)
   */
  createComment: async (resourceId, content, parentId = null) => {
    try {
      console.log('💬 Interactions - Creating comment:', {
        resourceId,
        contentLength: content.length,
        parentId,
        isReply: parentId !== null
      });
      const response = await axiosInstance.post('/interactions/comment/', {
        resource: resourceId,
        content,
        parent: parentId,
      });
      console.log('💬 Interactions - Comment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create comment error:', error);
      throw error.response?.data || { error: 'Failed to create comment' };
    }
  },

  /**
   * Update a comment
   * Only comment owner can edit
   */
  updateComment: async (commentId, content) => {
    try {
      console.log('💬 Interactions - Updating comment:', commentId);
      const response = await axiosInstance.patch(
        `/interactions/comment/${commentId}/`,
        { content }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update comment' };
    }
  },

  /**
   * Delete a comment
   * Can't delete if it has replies (400 error)
   */
  deleteComment: async (commentId) => {
    try {
      const response = await axiosInstance.delete(
        `/interactions/comment/${commentId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete comment' };
    }
  },

  // BOOKMARKS
  /**
   * Create a bookmark
   * Rate limit: 100 bookmarks/hour per user
   */
  bookmark: async (resourceId) => {
    try {
      const response = await axiosInstance.post('/interactions/bookmark/', {
        resource: resourceId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        error: 'Failed to bookmark resource',
      };
    }
  },

  /**
   * Remove a bookmark
   */
  unbookmark: async (bookmarkId) => {
    try {
      const response = await axiosInstance.delete(
        `/interactions/bookmark/${bookmarkId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        error: 'Failed to remove bookmark',
      };
    }
  },

  /**
   * Get user's bookmarks with resource details
   * Supports pagination and filtering
   */
  getBookmarks: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/interactions/bookmark/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch bookmarks' };
    }
  },

  /**
   * Get paginated bookmarks
   */
  getBookmarksPage: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get('/interactions/bookmark/', {
        params: { page, page_size: pageSize },
      });
      return {
        bookmarks: response.data.results,
        total: response.data.count,
        hasNext: response.data.next !== null,
        hasPrevious: response.data.previous !== null,
        nextUrl: response.data.next,
        previousUrl: response.data.previous,
      };
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch bookmarks' };
    }
  },

  /**
   * Check if user has bookmarked a resource (helper)
   */
  isBookmarked: async (resourceId) => {
    try {
      const response = await axiosInstance.get('/interactions/bookmark/', {
        params: { resource: resourceId },
      });
      return response.data.results && response.data.results.length > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get bookmark count for a resource (helper)
   */
  getBookmarkCount: async (resourceId) => {
    try {
      const response = await axiosInstance.get('/interactions/bookmark/', {
        params: { resource: resourceId, page_size: 1 },
      });
      return response.data.count || 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Helper: Get comments filtered by resource
   */
  getCommentsByResource: async (resourceId, params = {}) => {
    try {
      const response = await interactionService.getAllComments({
        resource: resourceId,
        ...params,
      });
      return response.results || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Helper: Get resource's direct comments (not replies)
   */
  getResourceComments: async (resourceId, params = {}) => {
    try {
      const response = await interactionService.getAllComments({
        resource: resourceId,
        parent__isnull: true,
        ...params,
      });
      return response.results || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Helper: Get comment replies (by parent ID)
   */
  getCommentReplies: async (parentCommentId, params = {}) => {
    try {
      const response = await interactionService.getAllComments({
        parent: parentCommentId,
        ...params,
      });
      return response.results || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Helper: Get comment count for a resource
   */
  getCommentCount: async (resourceId) => {
    try {
      const response = await interactionService.getAllComments({
        resource: resourceId,
        page_size: 1,
      });
      return response.count || 0;
    } catch (error) {
      return 0;
    }
  },
};

export default interactionService;
