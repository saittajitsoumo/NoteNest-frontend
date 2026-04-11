import axiosInstance from '../api/axios';

/**
 * Resource Service
 * Handles all resource-related API calls
 * Resource types: notes, assignment, lab_report, question_bank, textbook
 */
const resourceService = {
  /**
   * Get all resources with filters and search
   * Supports: department, course, semester, resource_type, search, ordering, page
   */
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resources' };
    }
  },

  /**
   * Get resource by ID - increments view_count
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/resources/resources/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resource' };
    }
  },

  /**
   * Create/Upload a resource (multipart/form-data)
   * Max file size: 50MB
   * Rate limit: 10 uploads/hour per user
   */
  create: async (data) => {
    try {
      const response = await axiosInstance.post('/resources/resources/', data);
      return response.data;
    } catch (error) {
      console.error('Upload error details:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      throw error.response?.data || error.message || { error: 'Failed to upload resource' };
    }
  },

  /**
   * Update resource
   * Non-staff users editing approved resources will reset to pending
   */
  update: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/resources/resources/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update resource' };
    }
  },

  /**
   * Delete resource
   * Only resource owner or staff can delete
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/resources/resources/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete resource' };
    }
  },

  /**
   * Download resource - increments download_count
   * Returns download URL and file info
   * Rate limit: 500 downloads/hour per user
   */
  download: async (id) => {
    try {
      const response = await axiosInstance.get(`/resources/resources/${id}/download/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to download resource' };
    }
  },

  /**
   * Get paginated resources with helper
   */
  getPage: async (page = 1, filters = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { page, ...filters },
      });
      return {
        resources: response.data.results,
        hasNext: response.data.next !== null,
        hasPrevious: response.data.previous !== null,
        total: response.data.count,
        nextUrl: response.data.next,
        previousUrl: response.data.previous,
      };
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch page' };
    }
  },

  /**
   * Search resources by title or description
   */
  search: async (query, filters = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { search: query, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Search failed' };
    }
  },

  /**
   * Get resources by department
   */
  getByDepartment: async (deptId, params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { department: deptId, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resources' };
    }
  },

  /**
   * Get resources by course
   */
  getByCourse: async (courseId, params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { course: courseId, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resources' };
    }
  },

  /**
   * Get resources by resource type
   */
  getByType: async (type, params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { resource_type: type, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resources' };
    }
  },

  /**
   * Get resources by semester
   */
  getBySemester: async (semesterId, params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { semester: semesterId, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resources' };
    }
  },

  /**
   * Get resources by semester year
   */
  getBySemesterYear: async (year, params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { semester__year: year, ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resources' };
    }
  },

  /**
   * Get resources by multiple criteria (department, course, semester, type)
   */
  getFiltered: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch resources' };
    }
  },

  /**
   * Get all pending resources (ADMIN ONLY)
   */
  getPending: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { status: 'pending', ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch pending resources' };
    }
  },

  /**
   * Get all approved resources (public view)
   */
  getApproved: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { status: 'approved', ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch approved resources' };
    }
  },

  /**
   * Get all rejected resources (ADMIN ONLY or owner)
   */
  getRejected: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/resources/resources/', {
        params: { status: 'rejected', ...params },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch rejected resources' };
    }
  },

  /**
   * Approve a resource (ADMIN ONLY)
   * Uses dedicated moderation endpoint
   */
  approve: async (id, actionId = null) => {
    try {
      // If we have a specific actionId, use the PATCH method as it's more reliable
      if (actionId) {
        console.log(`Approving via specific moderation action ${actionId}...`);
        const response = await axiosInstance.patch(`/moderation/action/${actionId}/`, {
          action: 'approved',
        });
        return response.data;
      }

      console.log(`Approving resource ${id} via general moderation endpoint...`);
      const response = await axiosInstance.post(`/moderation/action/`, {
        resource_id: id,
        action: 'approved',
        reason: 'Approved by moderator'
      });
      return response.data;
    } catch (error) {
      console.error('Moderation action failed, attempting direct resource status fallback...', error);
      try {
        const response = await axiosInstance.patch(`/resources/resources/${id}/`, {
          status: 'approved'
        });
        return response.data;
      } catch (fallbackError) {
        throw error.response?.data || error || { error: 'Failed to approve resource' };
      }
    }
  },

  /**
   * Reject a resource (ADMIN ONLY)
   * Uses dedicated moderation endpoint
   */
  reject: async (id, actionId = null, reason = 'Rejected due to policy violation') => {
    try {
      if (actionId) {
        console.log(`Rejecting via specific moderation action ${actionId}...`);
        const response = await axiosInstance.patch(`/moderation/action/${actionId}/`, {
          action: 'rejected',
          reason
        });
        return response.data;
      }

      console.log(`Rejecting resource ${id} via general moderation endpoint...`);
      const response = await axiosInstance.post(`/moderation/action/`, {
        resource_id: id,
        action: 'rejected',
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Moderation action failed, attempting direct resource status fallback...', error);
      try {
        const response = await axiosInstance.patch(`/resources/resources/${id}/`, {
          status: 'rejected'
        });
        return response.data;
      } catch (fallbackError) {
        throw error.response?.data || error || { error: 'Failed to reject resource' };
      }
    }
  },

  /**
   * Delete a resource (ADMIN ONLY or resource owner)
   */
  deleteResource: async (id) => {
    try {
      console.log(`Deleting resource ${id}...`);
      const response = await axiosInstance.delete(`/resources/resources/${id}/`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to delete resource' };
    }
  },

  /**
   * Report a resource
   */
  reportResource: async (resourceId, reason, description = '') => {
    try {
      console.log(`Reporting resource ${resourceId}...`);
      const response = await axiosInstance.post(`/moderation/report/`, {
        resource_id: resourceId,
        reason,
      });
      console.log('Report response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Report error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to report resource' };
    }
  },

  /**
   * Update a resource (for editing)
   */
  updateResource: async (id, data) => {
    try {
      console.log(`Updating resource ${id}...`);
      const response = await axiosInstance.patch(`/resources/resources/${id}/`, data);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to update resource' };
    }
  },
  createUploadFormData: (resourceData, file) => {
    const formData = new FormData();
    
    formData.append('title', resourceData.title);
    formData.append('description', resourceData.description);
    if (resourceData.tags) {
      resourceData.tags.forEach((tag) => {
        formData.append('tags', tag);
      });
    }
    formData.append('resource_type', resourceData.resourceType);
    formData.append('department', resourceData.department);
    formData.append('course', resourceData.course);
    formData.append('semester', resourceData.semester);
    
    if (file) {
      formData.append('file', file);
    }
    
    return formData;
  },

  /**
   * Upload a resource with proper FormData handling
   */
  uploadWithFormData: async (formData) => {
    try {
      const response = await axiosInstance.post('/resources/resources/', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to upload resource' };
    }
  },
};

/**
 * Academic Service - Departments, Courses, and Semesters
 */
export const academicService = {
  /**
   * Get all departments
   */
  getDepartments: async () => {
    try {
      const response = await axiosInstance.get('/academic/departments/');
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch departments' };
    }
  },

  /**
   * Get department courses
   */
  getDepartmentCourses: async (deptId) => {
    try {
      const response = await axiosInstance.get(
        `/academic/departments/${deptId}/courses/`
      );
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch courses' };
    }
  },

  /**
   * Get all courses with optional department filter
   */
  getCourses: async (deptId = null) => {
    try {
      const params = deptId ? { department: deptId } : {};
      const response = await axiosInstance.get('/academic/courses/', {
        params,
      });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch courses' };
    }
  },

  /**
   * Get all semesters (optionally active only)
   */
  getSemesters: async (activeOnly = true) => {
    try {
      const params = activeOnly ? { is_active: true } : {};
      const response = await axiosInstance.get('/academic/semesters/', {
        params,
      });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch semesters' };
    }
  },
};

export default resourceService;
