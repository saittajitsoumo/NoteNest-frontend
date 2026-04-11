import axiosInstance from '../api/axios';

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
const authService = {
  /**
   * Register a new user
   * Email must end with: @student.metrouni.ac.bd or @metrouni.edu.bd
   */
  register: async (data) => {
    try {
      const response = await axiosInstance.post('/accounts/register/', {
        email: data.email,
        username: data.username,
        password: data.password,
        confirm_password: data.password2, // API expects confirm_password field
        first_name: data.firstName,
        last_name: data.lastName,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  /**
   * Verify email with activation link
   * uid and token come from email link
   */
  activateEmail: async (uid, token) => {
    try {
      const response = await axiosInstance.get(
        `/accounts/activate/${uid}/${token}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Activation failed' };
    }
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email) => {
    try {
      const response = await axiosInstance.post(
        '/accounts/resend-verification/',
        { email }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to resend email' };
    }
  },

  /**
   * Login user with email and password
   * Can also use username instead of email
   */
  login: async (data) => {
    try {
      // Support both email and username
      const loginPayload = {
        password: data.password,
      };
      
      if (data.email) {
        loginPayload.email = data.email;
      } else if (data.username) {
        loginPayload.username = data.username;
      } else {
        throw new Error('Email or username is required');
      }

      const response = await axiosInstance.post('/accounts/login/', loginPayload);
      
      // Store tokens and user info
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
      }
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post('/accounts/logout/');
      // Clear tokens and user info
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      // Clear tokens even if logout request fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw error.response?.data || { error: 'Logout failed' };
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await axiosInstance.post('/accounts/password-reset/', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to request reset' };
    }
  },

  /**
   * Confirm password reset with new password
   * API expects: re_new_password not confirm_password
   */
  confirmPasswordReset: async (uid, token, newPassword, reNewPassword) => {
    try {
      const response = await axiosInstance.post(
        '/accounts/password-reset-confirm/',
        {
          uid,
          token,
          new_password: newPassword,
          re_new_password: reNewPassword,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password reset failed' };
    }
  },

  /**
   * Get current user profile
   */
  getCurrentProfile: async () => {
    try {
      const response = await axiosInstance.get('/accounts/me/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch profile' };
    }
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.patch('/accounts/me/', {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
      });
      // Update stored user
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update profile' };
    }
  },

  /**
   * Get user profile by ID
   */
  getUserProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(`/accounts/users/${userId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch user' };
    }
  },

  /**
   * Change password for logged-in user
   * API expects: confirm_password field (not re_new_password)
   */
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await axiosInstance.post('/accounts/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to change password' };
    }
  },

  /**
   * Get currently logged-in user from localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get access token
   */
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  /**
   * Get refresh token
   */
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },
};

export default authService;
