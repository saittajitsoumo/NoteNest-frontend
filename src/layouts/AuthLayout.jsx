import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* SaaS mesh bg */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-background to-background opacity-50 dark:from-indigo-900/40"></div>
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-glow-primary"
            >
              <span className="text-white font-bold text-2xl">N</span>
            </motion.div>
            <span className="text-2xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">NoteNest</span>
          </Link>
        </div>

        <h2 className="mt-2 text-center text-3xl font-extrabold text-foreground tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="mx-4 sm:mx-0 bg-card py-8 px-4 shadow-soft sm:rounded-xl sm:px-10 border border-border">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
