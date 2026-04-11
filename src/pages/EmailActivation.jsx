import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function EmailActivation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activateEmail, error, clearError } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    const activate = async () => {
      if (!uid || !token) {
        setStatus('error');
        return;
      }

      try {
        clearError();
        await activateEmail(uid, token);
        setStatus('success');
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        console.error('Activation error:', err);
        setStatus('error');
      }
    };

    activate();
  }, [uid, token, activateEmail, clearError, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        {/* Loading State */}
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="flex justify-center"
            >
              <Loader className="w-12 h-12 text-blue-600" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900">Verifying Email...</h2>
            <p className="text-gray-600">Please wait while we activate your account.</p>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
            <p className="text-gray-600">
              Your account has been successfully activated. Redirecting to login...
            </p>
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-sm text-gray-500"
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full mx-auto animate-pulse" />
            </motion.div>
            <Link
              to="/login"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Go to Login
            </Link>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <AlertCircle className="w-16 h-16 text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                {error || 'The activation link is invalid or has expired.'}
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              Please try signing up again or contact support if you need help.
            </p>
            <div className="space-y-2">
              <Link
                to="/register"
                className="block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Try Registering Again
              </Link>
              <Link
                to="/login"
                className="block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Back to Login
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
