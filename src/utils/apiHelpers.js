/**
 * API Helper Utilities
 * Common helper functions for API operations and data manipulation
 */

import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  RESOURCE_STATUS_LABELS,
  MODERATION_ACTION_LABELS,
  REPORT_STATUS_LABELS,
} from './apiConstants';

// ============= DATA FORMATTING HELPERS =============

/**
 * Format resource for display
 * Adds display-friendly labels and computed fields
 */
export const formatResource = (resource) => {
  return {
    ...resource,
    typeLabel: RESOURCE_TYPE_LABELS[resource.resource_type] || resource.resource_type,
    statusLabel: RESOURCE_STATUS_LABELS[resource.status] || resource.status,
    uploaderName: resource.uploaded_by
      ? `${resource.uploaded_by.first_name} ${resource.uploaded_by.last_name}`
      : 'Unknown',
    departmentCode: resource.department?.code || 'N/A',
    courseCode: resource.course?.course_code || 'N/A',
    semesterName: resource.semester
      ? `${resource.semester.name} ${resource.semester.year}`
      : 'N/A',
  };
};

/**
 * Format multiple resources
 */
export const formatResources = (resources) => {
  return Array.isArray(resources) ? resources.map(formatResource) : [];
};

/**
 * Format user for display
 */
export const formatUser = (user) => {
  return {
    ...user,
    fullName: `${user.first_name} ${user.last_name}`,
    displayName: user.first_name || user.username,
  };
};

/**
 * Format comment for display
 */
export const formatComment = (comment) => {
  return {
    ...comment,
    authorName: comment.user
      ? `${comment.user.first_name} ${comment.user.last_name}`
      : 'Unknown',
    isReply: comment.parent !== null,
  };
};

/**
 * Format notification for display
 */
export const formatNotification = (notification) => {
  const icons = {
    'Resource Approved': '✓',
    'Resource Rejected': '✗',
    'New Comment': '💬',
    'New Like': '❤️',
  };

  return {
    ...notification,
    icon: icons[notification.title] || '📬',
    relativeTime: getRelativeTime(notification.created_at),
  };
};

/**
 * Format report for display
 */
export const formatReport = (report) => {
  return {
    ...report,
    statusLabel: REPORT_STATUS_LABELS[report.status] || report.status,
    reporterName: report.reported_by
      ? `${report.reported_by.first_name} ${report.reported_by.last_name}`
      : 'Anonymous',
  };
};

// ============= TIME/DATE HELPERS =============

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

/**
 * Format date for display
 */
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (format === 'short') {
    return date.toLocaleDateString();
  }
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  if (format === 'full') {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString();
};

// ============= VALIDATION HELPERS =============

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Returns object with score (0-3) and feedback
 */
export const validatePassword = (password) => {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Password should be at least 8 characters');
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Use both uppercase and lowercase letters');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters for stronger security');
  }

  return {
    score: Math.min(score, 3),
    strength: score === 0 ? 'Weak' : score <= 2 ? 'Fair' : 'Strong',
    feedback,
    isValid: score >= 2,
  };
};

/**
 * Validate file for upload
 */
export const validateFile = (file, maxSizeMB = 50, acceptedFormats = []) => {
  const errors = [];

  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size should not exceed ${maxSizeMB}MB`);
  }

  if (acceptedFormats.length > 0) {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExt)) {
      errors.push(`File format should be one of: ${acceptedFormats.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============= STATISTICS HELPERS =============

/**
 * Calculate reading time (in minutes)
 * Assumes average reading speed of 200 words per minute
 */
export const calculateReadingTime = (text) => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
};

/**
 * Format view count
 * e.g., 1234 -> "1.2K"
 */
export const formatViewCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// ============= FILTER & SEARCH HELPERS =============

/**
 * Build query params from filters object
 */
export const buildQueryParams = (filters) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  }

  return params.toString();
};

/**
 * Parse query params to object
 */
export const parseQueryParams = (queryString) => {
  if (!queryString) return {};

  const params = new URLSearchParams(queryString);
  const obj = {};

  for (const [key, value] of params.entries()) {
    if (obj[key]) {
      // Convert to array if multiple values
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
  }

  return obj;
};

/**
 * Filter resources by status
 */
export const filterByStatus = (resources, status) => {
  return resources.filter((r) => r.status === status);
};

/**
 * Filter resources by department
 */
export const filterByDepartment = (resources, deptId) => {
  return resources.filter((r) => r.department?.id === deptId);
};

/**
 * Filter resources by type
 */
export const filterByType = (resources, type) => {
  return resources.filter((r) => r.resource_type === type);
};

/**
 * Sort resources
 */
export const sortResources = (resources, sortBy = 'created_at') => {
  const sorted = [...resources];
  const isDescending = sortBy.startsWith('-');
  const field = isDescending ? sortBy.slice(1) : sortBy;

  sorted.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle nested properties
    if (field.includes('.')) {
      const parts = field.split('.');
      aVal = parts.reduce((obj, key) => obj?.[key], a);
      bVal = parts.reduce((obj, key) => obj?.[key], b);
    }

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison = aVal < bVal ? -1 : 1;
    return isDescending ? -comparison : comparison;
  });

  return sorted;
};

// ============= SEARCH & HIGHLIGHTHELPERS =============

/**
 * Highlight search term in text
 */
export const highlightSearchTerm = (text, term) => {
  if (!term) return text;

  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Extract search summary (preview)
 */
export const getSearchPreview = (text, term, previewLength = 150) => {
  if (!term || !text) return text.substring(0, previewLength);

  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return text.substring(0, previewLength);

  const start = Math.max(0, index - previewLength / 2);
  const end = Math.min(text.length, start + previewLength);

  let preview = text.substring(start, end);
  if (start > 0) preview = '...' + preview;
  if (end < text.length) preview += '...';

  return preview;
};

export default {
  formatResource,
  formatResources,
  formatUser,
  formatComment,
  formatNotification,
  formatReport,
  getRelativeTime,
  formatDate,
  isValidEmail,
  validatePassword,
  validateFile,
  calculateReadingTime,
  formatViewCount,
  formatFileSize,
  buildQueryParams,
  parseQueryParams,
  filterByStatus,
  filterByDepartment,
  filterByType,
  sortResources,
  highlightSearchTerm,
  getSearchPreview,
};
