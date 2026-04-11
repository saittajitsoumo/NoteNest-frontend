/**
 * API Constants
 * Centralized definitions for API endpoints, resource types, and other constants
 */

// Base URL - Can be moved to .env
export const API_BASE_URL = 'https://notenest-backend-hd5r.onrender.com/api';

// Request timeout in milliseconds
export const API_TIMEOUT = 15000;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// ============= RESOURCE TYPES =============
export const RESOURCE_TYPES = {
  LECTURE_NOTE: 'lecture_note',
  ASSIGNMENT: 'assignment',
  LAB_REPORT: 'lab_report',
  QUESTION_BANK: 'question_bank',
  BOOK: 'book',
};

export const RESOURCE_TYPE_LABELS = {
  lecture_note: 'Lecture Note',
  assignment: 'Assignment',
  lab_report: 'Lab Report',
  question_bank: 'Question Bank',
  book: 'Textbook',
};

export const RESOURCE_TYPE_OPTIONS = Object.entries(RESOURCE_TYPES).map(([key, value]) => ({
  value,
  label: RESOURCE_TYPE_LABELS[value] || key,
}));

// ============= REPORT REASONS =============
export const REPORT_REASONS = {
  INAPPROPRIATE: 'Inappropriate Content',
  COPYRIGHT: 'Copyright Violation',
  SPAM: 'Spam',
  DUPLICATE: 'Duplicate',
  OTHER: 'Other',
};

export const REPORT_REASON_OPTIONS = Object.values(REPORT_REASONS).map((reason) => ({
  value: reason,
  label: reason,
}));

// ============= STATUS OPTIONS =============
export const RESOURCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const RESOURCE_STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const RESOURCE_STATUS_OPTIONS = Object.entries(RESOURCE_STATUS).map(([key, value]) => ({
  value,
  label: RESOURCE_STATUS_LABELS[value] || key,
}));

export const REPORT_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const REPORT_STATUS_LABELS = {
  pending: 'Pending',
  resolved: 'Resolved',
  closed: 'Closed',
};

// ============= MODERATION ACTIONS =============
export const MODERATION_ACTIONS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const MODERATION_ACTION_LABELS = {
  approved: 'Approved',
  rejected: 'Rejected',
};

// ============= API ENDPOINTS =============
export const ENDPOINTS = {
  // Authentication
  REGISTER: '/accounts/register/',
  LOGIN: '/accounts/login/',
  LOGOUT: '/accounts/logout/',
  ACTIVATE: '/accounts/activate/',
  RESEND_VERIFICATION: '/accounts/resend-verification/',
  PASSWORD_RESET: '/accounts/password-reset/',
  PASSWORD_RESET_CONFIRM: '/accounts/password-reset-confirm/',
  CHANGE_PASSWORD: '/accounts/change-password/',
  PROFILE: '/accounts/me/',
  USERS: '/accounts/users/',

  // Resources
  RESOURCES: '/resources/resources/',
  RESOURCES_DOWNLOAD: '/resources/resources/{id}/download/',

  // Academic
  DEPARTMENTS: '/academic/departments/',
  COURSES: '/academic/courses/',
  SEMESTERS: '/academic/semesters/',

  // Interactions
  LIKES: '/interactions/like/',
  COMMENTS: '/interactions/comment/',
  BOOKMARKS: '/interactions/bookmark/',

  // Moderation
  REPORTS: '/moderation/report/',
  MODERATION_ACTIONS: '/moderation/action/',

  // Notifications
  NOTIFICATIONS: '/notifications/',
};

// ============= RATE LIMITS =============
export const RATE_LIMITS = {
  UPLOAD: {
    limit: 10,
    window: 3600, // 1 hour in seconds
    message: 'Max 10 uploads per hour',
  },
  DOWNLOAD: {
    limit: 500,
    window: 3600,
    message: 'Max 500 downloads per hour',
  },
  INTERACTIONS: {
    limit: 100,
    window: 3600,
    message: 'Max 100 actions per hour',
  },
  RESEND_EMAIL: {
    limit: 1,
    window: 60, // 60 seconds
    message: 'Please wait 60 seconds before resending',
  },
};

// ============= FILE UPLOAD SETTINGS =============
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  ACCEPTED_FORMATS: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
  ACCEPTED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
  ],
};

// ============= VALIDATION RULES =============
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 8,
  COMMENT_MAX_LENGTH: 5000,
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 5000,
};

// ============= ORDERING OPTIONS =============
export const ORDERING_OPTIONS = {
  NEWEST: '-created_at',
  OLDEST: 'created_at',
  MOST_VIEWED: '-view_count',
  MOST_DOWNLOADED: '-download_count',
  MOST_LIKED: '-likes_count',
  UPDATED: '-updated_at',
};

export const ORDERING_LABELS = {
  '-created_at': 'Newest First',
  'created_at': 'Oldest First',
  '-view_count': 'Most Viewed',
  '-download_count': 'Most Downloaded',
  '-likes_count': 'Most Liked',
  '-updated_at': 'Recently Updated',
};

// ============= LOCAL STORAGE KEYS =============
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  RECENT_SEARCHES: 'recentSearches',
  LAST_VIEWED_RESOURCE: 'lastViewedResource',
};

// ============= TIME CONSTANTS =============
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
};

// ============= API RESPONSE CODES =============
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_OPTIONS,
  REPORT_REASONS,
  REPORT_REASON_OPTIONS,
  RESOURCE_STATUS,
  RESOURCE_STATUS_LABELS,
  RESOURCE_STATUS_OPTIONS,
  MODERATION_ACTIONS,
  MODERATION_ACTION_LABELS,
  ENDPOINTS,
  RATE_LIMITS,
  FILE_UPLOAD,
  VALIDATION,
  ORDERING_OPTIONS,
  ORDERING_LABELS,
  STORAGE_KEYS,
  TIME,
  HTTP_STATUS,
};
