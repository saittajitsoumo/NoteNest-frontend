/**
 * API Error Utilities
 * Standardized error handling and mapping for API responses
 */

/**
 * Common API error messages mapping
 */
export const errorMessageMap = {
  NETWORK_ERROR: 'Network connection error. Please check your internet.',
  TIMEOUT: 'Request timeout. Server took too long to respond.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'You are not authenticated. Please login.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.',
  GENERIC: 'Something went wrong. Please try again.',
};

/**
 * Parse API error response
 * Returns standardized error object
 */
export const parseError = (error) => {
  const errorObj = {
    status: null,
    message: errorMessageMap.GENERIC,
    errors: null,
    isRateLimit: false,
    isAuthError: false,
    isValidationError: false,
  };

  if (!error) {
    return errorObj;
  }

  // Network error
  if (!error.response) {
    errorObj.message = error.code === 'ECONNABORTED' 
      ? errorMessageMap.TIMEOUT 
      : errorMessageMap.NETWORK_ERROR;
    return errorObj;
  }

  const status = error.response.status;
  const data = error.response.data;

  errorObj.status = status;

  // Handle rate limiting
  if (status === 429) {
    errorObj.message = errorMessageMap.RATE_LIMIT;
    errorObj.isRateLimit = true;
    if (data?.detail) {
      errorObj.message = data.detail;
    }
    return errorObj;
  }

  // Handle authentication/authorization
  if (status === 401) {
    errorObj.message = errorMessageMap.UNAUTHORIZED;
    errorObj.isAuthError = true;
    return errorObj;
  }

  if (status === 403) {
    errorObj.message = errorMessageMap.FORBIDDEN;
    return errorObj;
  }

  // Handle not found
  if (status === 404) {
    errorObj.message = errorMessageMap.NOT_FOUND;
    return errorObj;
  }

  // Handle validation errors (400)
  if (status === 400) {
    errorObj.isValidationError = true;
    errorObj.errors = data;
    
    // Try to extract meaningful message
    if (typeof data === 'object' && data !== null) {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError) && firstError[0]) {
        errorObj.message = firstError[0];
      } else if (data.detail) {
        errorObj.message = data.detail;
      } else if (data.error) {
        errorObj.message = data.error;
      } else {
        errorObj.message = errorMessageMap.VALIDATION_ERROR;
      }
    }
    return errorObj;
  }

  // Handle server errors
  if (status >= 500) {
    errorObj.message = errorMessageMap.SERVER_ERROR;
    return errorObj;
  }

  // Generic message from response
  if (data?.detail) {
    errorObj.message = data.detail;
  } else if (data?.error) {
    errorObj.message = data.error;
  } else if (data?.message) {
    errorObj.message = data.message;
  }

  return errorObj;
};

/**
 * Format validation errors for display
 * Takes error object and returns formatted message or error map
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return errorMessageMap.VALIDATION_ERROR;
  }

  // If it's a simple detail message
  if (errors.detail) {
    return errors.detail;
  }

  // If it's field errors
  const formattedErrors = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      formattedErrors[field] = messages.join(', ');
    } else {
      formattedErrors[field] = messages;
    }
  }

  return formattedErrors;
};

/**
 * Check if error is a rate limit error
 */
export const isRateLimitError = (error) => {
  return error?.response?.status === 429;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error) => {
  return error?.response?.status === 400;
};

/**
 * Check if error is a not found error
 */
export const isNotFoundError = (error) => {
  return error?.response?.status === 404;
};

/**
 * Check if error is a server error
 */
export const isServerError = (error) => {
  return error?.response?.status >= 500;
};

/**
 * Extract rate limit wait time from error response
 * Returns wait time in seconds or null
 */
export const getRateLimitWaitTime = (error) => {
  if (!isRateLimitError(error)) {
    return null;
  }

  const message = error.response?.data?.detail || '';
  const match = message.match(/(\d+)\s+seconds/);
  
  return match ? parseInt(match[1]) : null;
};

/**
 * Create user-friendly error message for display in UI
 */
export const getUserFriendlyError = (error) => {
  const parsed = parseError(error);
  
  if (parsed.isRateLimit) {
    const waitTime = getRateLimitWaitTime(error);
    if (waitTime) {
      return `Please wait ${waitTime} seconds before trying again.`;
    }
    return parsed.message;
  }

  if (parsed.isAuthError) {
    return 'Your session has expired. Please log in again.';
  }

  if (parsed.isValidationError) {
    return parsed.message || 'Please check your input and try again.';
  }

  return parsed.message;
};

/**
 * Standard error handler for async operations
 * Usage: catch((error) => handleApiError(error, 'Operation'))
 */
export const handleApiError = (error, context = 'Operation') => {
  console.error(`${context} failed:`, error);
  
  const parsed = parseError(error);
  
  return {
    success: false,
    message: parsed.message,
    status: parsed.status,
    errors: parsed.errors,
    isRateLimit: parsed.isRateLimit,
    isAuthError: parsed.isAuthError,
    isValidationError: parsed.isValidationError,
  };
};

/**
 * Extract field errors for form validation
 * Returns object mapping field names to error messages
 */
export const extractFieldErrors = (error) => {
  if (!isValidationError(error)) {
    return {};
  }

  const data = error.response?.data || {};
  const fieldErrors = {};

  for (const [field, messages] of Object.entries(data)) {
    if (Array.isArray(messages)) {
      fieldErrors[field] = messages[0]; // Use first error message
    } else if (typeof messages === 'string') {
      fieldErrors[field] = messages;
    }
  }

  return fieldErrors;
};

export default {
  parseError,
  formatValidationErrors,
  isRateLimitError,
  isAuthError,
  isValidationError,
  isNotFoundError,
  isServerError,
  getRateLimitWaitTime,
  getUserFriendlyError,
  handleApiError,
  extractFieldErrors,
  errorMessageMap,
};
