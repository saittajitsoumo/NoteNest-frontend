import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, error: authError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onBlur',
  });

  // Handle email verification redirect
  useEffect(() => {
    const verified = searchParams.get('verified');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (verified === 'true') {
      setVerificationMessage({
        type: 'success',
        text: '✅ Email verified! You can now login.'
      });
      if (email) {
        setValue('username', email);
      }
    } else if (verified === 'false') {
      setVerificationMessage({
        type: 'error',
        text: `❌ Verification failed: ${error ? decodeURIComponent(error) : 'Invalid or expired link'}`
      });
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    try {
      clearError();
      await login({
        username: data.username,
        password: data.password,
      });
      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your NoteNest account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Verification Message */}
        {verificationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-start gap-3 ${
              verificationMessage.type === 'success'
                ? 'bg-green-50/80 border border-green-200'
                : 'bg-red-50/80 border border-red-200'
            }`}
          >
            {verificationMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm font-medium ${
              verificationMessage.type === 'success'
                ? 'text-green-800'
                : 'text-red-800'
            }`}>
              {verificationMessage.text}
            </p>
          </motion.div>
        )}

        {/* API Error Alert with Animation */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium text-sm">{authError}</p>
            </div>
          </motion.div>
        )}

        {/* Username Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-2">
            Username
          </label>
          <motion.input
            type="text"
            id="username"
            placeholder="Enter your username"
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
            })}
            whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition bg-background text-foreground placeholder-muted-foreground ${
              errors.username
                ? 'border-destructive focus:ring-destructive'
                : 'border-input focus:ring-primary'
            }`}
          />
          {errors.username && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-300 text-sm mt-1"
            >
              {errors.username.message}
            </motion.p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <motion.input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition pr-10 bg-background text-foreground placeholder-muted-foreground ${
                errors.password
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              }`}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          {errors.password && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-300 text-sm mt-1"
            >
              {errors.password.message}
            </motion.p>
          )}
        </motion.div>

        {/* Forgot Password Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-right"
        >
          <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition">
            Forgot password?
          </Link>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>

      {/* Sign Up Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-muted-foreground text-sm mt-6"
      >
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition">
          Sign up
        </Link>
      </motion.p>
    </AuthLayout>
  );
}
