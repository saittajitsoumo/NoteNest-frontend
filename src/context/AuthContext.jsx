import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider component to wrap the app
 * Manages user authentication state globally
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsVerified(parsedUser.is_verified || false);
          
          // Fetch full profile to ensure we have is_staff
          try {
            const profileData = await authService.getCurrentProfile();
            const enrichedUser = {
              ...parsedUser,
              ...profileData,
            };
            setUser(enrichedUser);
            localStorage.setItem('user', JSON.stringify(enrichedUser));
          } catch (profileErr) {
            console.warn('Could not sync full profile:', profileErr);
          }
        } catch (err) {
          console.error('Failed to parse stored user:', err);
          // Clear corrupted data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Handle user registration
   * Email must end with: @student.metrouni.ac.bd or @metrouni.edu.bd
   */
  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      // After registration, email verification is required
      return {
        message: data.message,
        email: userData.email,
      };
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Registration failed';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Activate/verify email with uid and token from email
   */
  const activateEmail = async (uid, token) => {
    try {
      setError(null);
      const data = await authService.activateEmail(uid, token);
      return data;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Activation failed';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Resend verification email
   */
  const resendVerification = async (email) => {
    try {
      setError(null);
      const data = await authService.resendVerification(email);
      return data;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Failed to resend';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Handle user login
   * Requires username and password
   */
  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authService.login(credentials);
      setUser(data.user);
      setIsAuthenticated(true);
      setIsVerified(data.user.is_verified || false);
      
      // Fetch full user profile to get is_staff and other fields
      try {
        const profileData = await authService.getCurrentProfile();
        const enrichedUser = {
          ...data.user,
          ...profileData, // This will add is_staff, is_superuser, etc.
        };
        setUser(enrichedUser);
        localStorage.setItem('user', JSON.stringify(enrichedUser));
      } catch (profileErr) {
        console.warn('Could not fetch full profile:', profileErr);
        // Continue with basic user data if profile fetch fails
      }
      
      return data;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Handle user logout
   */
  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setIsVerified(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if logout API call fails
      setUser(null);
      setIsAuthenticated(false);
      setIsVerified(false);
    }
  };

  /**
   * Request password reset email
   */
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const data = await authService.requestPasswordReset(email);
      return data;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Failed to request reset';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Confirm password reset with new password
   */
  const confirmPasswordReset = async (uid, token, newPassword, confirmPassword) => {
    try {
      setError(null);
      const data = await authService.confirmPasswordReset(
        uid,
        token,
        newPassword,
        confirmPassword
      );
      return data;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Password reset failed';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Get current user profile from API
   */
  const getCurrentProfile = async () => {
    try {
      setError(null);
      const profile = await authService.getCurrentProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      setIsVerified(profile.is_verified || false);
      return profile;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Failed to fetch profile';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Update current user profile
   */
  const updateProfile = async (data) => {
    try {
      setError(null);
      const updated = await authService.updateProfile(data);
      setUser(updated);
      setIsVerified(updated.is_verified || false);
      return updated;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Failed to update profile';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Change password
   */
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      setError(null);
      const data = await authService.changePassword(
        oldPassword,
        newPassword,
        confirmPassword
      );
      return data;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err.detail || 'Failed to change password';
      setError(errorMsg);
      throw err;
    }
  };

  /**
   * Clear error messages
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    isVerified,
    register,
    activateEmail,
    resendVerification,
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    getCurrentProfile,
    updateProfile,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use Auth Context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
