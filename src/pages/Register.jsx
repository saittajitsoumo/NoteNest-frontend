import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle, Info, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, error: authError, clearError } = useAuth();
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form' or 'verification'
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const password = watch('password');
  const email = watch('email');

  const onSubmit = async (data) => {
    try {
      clearError();
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        password2: data.confirmPassword, // API requires both password and password2
      });
      setRegisteredEmail(data.email);
      setRegistrationStep('verification');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      clearError();
      const { resendVerification } = useAuth();
      // We need to call from context
      setResendLoading(false);
      // In a real app, you'd trigger a success notification
    } catch (err) {
      console.error('Resend error:', err);
      setResendLoading(false);
    }
  };

  // Registration Form Step
  if (registrationStep === 'form') {
    return (
      <AuthLayout
        title="Create Account"
        subtitle="Join NoteNest to access learning resources"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Info Alert */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-3 bg-blue-500/20 border border-blue-300/50 rounded-xl flex items-start gap-2 backdrop-blur-sm"
          >
            <Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
            <p className="text-blue-200 text-xs">
              Email must end with @student.metrouni.ac.bd or @metrouni.edu.bd
            </p>
          </motion.div>

          {/* First Name Field */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label htmlFor="firstName" className="block text-sm font-semibold text-foreground mb-2">
              First Name
            </label>
            <motion.input
              type="text"
              id="firstName"
              placeholder="Enter your first name"
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition bg-background text-foreground placeholder-muted-foreground ${
                errors.firstName
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              }`}
            />
            {errors.firstName && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 text-sm mt-1"
              >
                {errors.firstName.message}
              </motion.p>
            )}
          </motion.div>

          {/* Last Name Field */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <label htmlFor="lastName" className="block text-sm font-semibold text-foreground mb-2">
              Last Name
            </label>
            <motion.input
              type="text"
              id="lastName"
              placeholder="Enter your last name"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition bg-background text-foreground placeholder-muted-foreground ${
                errors.lastName
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              }`}
            />
            {errors.lastName && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 text-sm mt-1"
              >
                {errors.lastName.message}
              </motion.p>
            )}
          </motion.div>

          {/* Username Field */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-2">
              Username
            </label>
            <motion.input
              type="text"
              id="username"
              placeholder="Choose a username"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'Username can only contain letters, numbers, underscore, and dash' },
              })}
              whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition bg-background text-foreground placeholder-muted-foreground ${
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

          {/* Email Field */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
              University Email
            </label>
            <motion.input
              type="email"
              id="email"
              placeholder="student@student.metrouni.ac.bd"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email',
                },
                validate: (value) => {
                  if (
                    !value.endsWith('@student.metrouni.ac.bd') &&
                    !value.endsWith('@metrouni.edu.bd') && !value.endsWith('@gmail.com')
                  ) {
                    return 'Email must be from metrouni.ac.bd domain';
                  }
                  return true;
                },
              })}
              whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition bg-background text-foreground placeholder-muted-foreground ${
                errors.email
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              }`}
            />
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 text-sm mt-1"
              >
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <motion.input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Create a strong password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                    message: 'Password must contain uppercase, lowercase, number, and special character',
                  },
                })}
                whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition pr-10 bg-background text-foreground placeholder-muted-foreground ${
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
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            <p className="text-xs text-muted-foreground mt-1">
              Must contain uppercase, lowercase, number, and special character (@$!%*?&)
            </p>
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
              Confirm Password
            </label>
            <motion.input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              whileFocus={{ scale: 1.01, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition bg-background text-foreground placeholder-muted-foreground ${
                errors.confirmPassword
                  ? 'border-destructive focus:ring-destructive'
                  : 'border-input focus:ring-primary'
              }`}
            />
            {errors.confirmPassword && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 text-sm mt-1"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </motion.div>

          {/* Terms Agreement */}
          <motion.label
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="flex items-start cursor-pointer"
          >
            <input
              type="checkbox"
              required
              className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer mt-0.5 bg-background border-input"
            />
            <span className="ml-2 text-sm text-muted-foreground">
              I agree to the{' '}
              <a href="#terms" className="text-primary hover:text-primary/80 transition">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#privacy" className="text-primary hover:text-primary/80 transition">
                Privacy Policy
              </a>
            </span>
          </motion.label>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
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
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        {/* Sign In Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.26 }}
          className="text-center text-muted-foreground text-sm mt-6"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition">
            Sign in
          </Link>
        </motion.p>
      </AuthLayout>
    );
  }

  // Email Verification Step
  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Check your inbox for verification link"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Success Icon */}
        <div className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Registration Successful!</h3>
          <p className="text-gray-600">
            We've sent a verification link to <strong>{registeredEmail}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Please check your email and click the verification link to activate your account.
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Didn't receive the email?</strong> Check your spam folder or click the button below to resend.
          </p>
        </div>

        {/* Resend Button */}
        <motion.button
          type="button"
          onClick={handleResendEmail}
          disabled={resendLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendLoading ? 'Resending...' : 'Resend Verification Email'}
        </motion.button>

        {/* Back to Login */}
        <p className="text-center text-gray-600 text-sm">
          Already verified?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
