import axiosInstance from '../api/axios';

/**
 * Academic Service
 * Handles departments, courses, and semesters data
 */
const academicService = {
  /**
   * Get all departments
   * Access: Public (no auth required)
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
   * Get all courses with optional department filter
   * Access: Public
   */
  getCourses: async (deptId = null) => {
    try {
      const params = deptId ? { department: deptId } : {};
      const response = await axiosInstance.get('/academic/courses/', { params });
      return {
        courses: response.data.results,
        hasNext: response.data.next !== null,
        nextUrl: response.data.next,
        total: response.data.count,
      };
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch courses' };
    }
  },

  /**
   * Get all courses for a department (handles pagination)
   */
  getDepartmentCourses: async (deptId) => {
    try {
      console.log('📚 Fetching courses for department:', deptId);
      const response = await axiosInstance.get('/academic/courses/', {
        params: { department: deptId },
      });
      
      let allCourses = response.data.results || [];
      console.log(`📚 Got ${allCourses.length} courses, total available: ${response.data.count}`);
      
      // If there are more pages, fetch them all
      let nextUrl = response.data.next;
      while (nextUrl) {
        console.log('📚 Fetching next page of courses:', nextUrl);
        const nextResponse = await axiosInstance.get(nextUrl);
        const nextCourses = nextResponse.data.results || [];
        allCourses = [...allCourses, ...nextCourses];
        console.log(`📚 Got ${nextCourses.length} more courses, total now: ${allCourses.length}`);
        nextUrl = nextResponse.data.next;
      }
      
      console.log(`📚 Final course list for dept ${deptId}: ${allCourses.length} courses`);
      return allCourses;
    } catch (error) {
      console.error('Failed to fetch courses for department:', deptId, error);
      throw error.response?.data || { error: 'Failed to fetch courses' };
    }
  },

  /**
   * Get all semesters
   * Access: Admin only - but we can fetch for display
   */
  getSemesters: async (activeOnly = false) => {
    try {
      const params = activeOnly ? { is_active: true } : {};
      const response = await axiosInstance.get('/academic/semesters/', { params });
      return response.data.results;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch semesters' };
    }
  },

  /**
   * Get active semesters only
   */
  getActiveSemesters: async () => {
    return academicService.getSemesters(true);
  },

  /**
   * Format department for dropdowns
   */
  formatDepartmentOptions: (departments) => {
    return departments.map(dept => ({
      value: dept.id,
      label: `${dept.name} (${dept.code})`,
      code: dept.code,
    }));
  },

  /**
   * Format courses for dropdowns
   */
  formatCourseOptions: (courses) => {
    return courses.map(course => ({
      value: course.id,
      label: `${course.course_code} - ${course.title}`,
      courseCode: course.course_code,
      title: course.title,
      department: course.department,
    }));
  },

  /**
   * Format semesters for dropdowns
   */
  formatSemesterOptions: (semesters) => {
    return semesters.map(sem => ({
      value: sem.id,
      label: `${sem.name} ${sem.year}${sem.is_active ? ' (Active)' : ''}`,
      name: sem.name,
      year: sem.year,
      isActive: sem.is_active,
    }));
  },

  /**
   * Get all available tags for resources
   * Fetches from existing resources since dedicated tags endpoint may not exist
   * Access: Public
   */
  getTags: async () => {
    try {
      // Try dedicated tags endpoint first
      try {
        const response = await axiosInstance.get('/resources/tags/');
        return response.data.results || response.data || [];
      } catch (tagsError) {
        // Fallback: Extract tags from existing resources
        console.warn('Tags endpoint not available, extracting from resources');
        const resourceResponse = await axiosInstance.get('/resources/resources/', {
          params: { page_size: 100 }
        });
        
        const tagMap = new Map();
        if (resourceResponse.data.results && Array.isArray(resourceResponse.data.results)) {
          resourceResponse.data.results.forEach(resource => {
            if (resource.tags && Array.isArray(resource.tags)) {
              resource.tags.forEach(tag => {
                if (tag.id && tag.name && !tagMap.has(tag.id)) {
                  tagMap.set(tag.id, tag);
                }
              });
            }
          });
        }
        
        return Array.from(tagMap.values());
      }
    } catch (error) {
      console.warn('Failed to fetch tags:', error);
      return [];
    }
  },
};

export default academicService;
