/**
 * String & Data Formatting Utilities
 */

/**
 * Format date to readable format
 * @param {string} dateString - ISO date string
 * @param {string} format - 'full', 'date', 'time'
 */
export const formatDate = (dateString, format = 'date') => {
  const date = new Date(dateString);
  
  const options = {
    full: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    date: { year: 'numeric', month: 'short', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
  };
  
  return date.toLocaleDateString('en-US', options[format] || options.date);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return formatDate(dateString);
};

/**
 * Format number with abbreviations (1K, 1M, etc.)
 */
export const formatCount = (number) => {
  if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
  if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
  return number.toString();
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, length) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Format author name
 */
export const formatAuthorName = (user) => {
  if (!user) return 'Unknown';
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username || user.email || 'Unknown';
};

/**
 * Get resource type icon and color
 */
export const getResourceTypeStyle = (resourceType) => {
  const styles = {
    notes: { icon: '', color: 'bg-blue-100 text-blue-800', badge: 'blue' },
    assignment: { icon: '', color: 'bg-orange-100 text-orange-800', badge: 'orange' },
    lab_report: { icon: '', color: 'bg-green-100 text-green-800', badge: 'green' },
    question_bank: { icon: '', color: 'bg-purple-100 text-purple-800', badge: 'purple' },
    textbook: { icon: '', color: 'bg-red-100 text-red-800', badge: 'red' },
  };
  return styles[resourceType] || { icon: '', color: 'bg-gray-100 text-gray-800', badge: 'gray' };
};

/**
 * Get status badge style
 */
export const getStatusStyle = (status) => {
  const styles = {
    pending: { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: '' },
    approved: { text: 'Approved', color: 'bg-green-100 text-green-800', icon: '' },
    rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800', icon: '' },
  };
  return styles[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: '' };
};

/**
 * Get notification icon based on title
 */
export const getNotificationIcon = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('approved')) return '✅';
  if (lowerTitle.includes('rejected')) return '❌';
  if (lowerTitle.includes('report')) return '🚩';
  if (lowerTitle.includes('like')) return '❤️';
  if (lowerTitle.includes('comment')) return '💬';
  return '🔔';
};

/**
 * Build comment tree from flat array
 */
export const buildCommentTree = (comments, parentId = null) => {
  return comments
    .filter(c => c.parent === parentId)
    .map(c => ({
      ...c,
      replies: buildCommentTree(comments, c.id),
    }));
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if user can edit resource
 */
export const canEditResource = (resource, currentUser) => {
  if (!currentUser) return false;
  return resource.uploaded_by.id === currentUser.id || currentUser.is_staff;
};

/**
 * Get full author display info
 */
export const getAuthorInfo = (uploadedBy, department) => {
  return {
    name: formatAuthorName(uploadedBy),
    department: department?.name || 'Unknown Department',
    code: department?.code || '',
  };
};

/**
 * Get semester display
 */
export const getSemesterDisplay = (semester) => {
  if (!semester) return '';
  return `${semester.name} ${semester.year}${semester.is_active ? ' (Active)' : ''}`;
};

/**
 * Get course display
 */
export const getCourseDisplay = (course) => {
  if (!course) return '';
  return `${course.course_code} - ${course.title}`;
};
