import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import ResourceCard from '../components/ResourceCard';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { BookOpen, Upload, Zap, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import resourceService from '../services/resourceService';

export default function Home() {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);

  useEffect(() => {
    const loadFeaturedResources = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch 6 most recently created approved resources
        const response = await resourceService.getAll({
          status: 'approved',
          ordering: '-created_at',
          page: 1,
        });
        const results = Array.isArray(response.results) ? response.results : (Array.isArray(response) ? response : []);
        // Additional filter to ensure only approved resources
        const filteredResults = results.filter(r => r.status === 'approved');
        setFeaturedResources(filteredResults.slice(0, 6) || []);
        setIsRateLimited(false); // Clear rate limit on success
      } catch (err) {
        console.error('Failed to load featured resources:', err);
        
        // Check for rate limit
        if (err.response?.status === 429) {
          setIsRateLimited(true);
          const retryAfterSeconds = parseInt(err.response?.data?.detail?.match(/\d+/) || 60);
          setRetryAfter(new Date(Date.now() + retryAfterSeconds * 1000));
          setError(`Server is rate limited. Please check back in ${Math.ceil(retryAfterSeconds / 60)} minutes.`);
        } else {
          setError('Failed to load featured resources');
        }
        setFeaturedResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedResources();
  }, []);

  // Clear rate limit after timer
  useEffect(() => {
    if (!retryAfter) return;
    
    const checkReset = setInterval(() => {
      if (Date.now() >= retryAfter.getTime()) {
        setIsRateLimited(false);
        setRetryAfter(null);
        clearInterval(checkReset);
      }
    }, 1000);
    
    return () => clearInterval(checkReset);
  }, [retryAfter]);

  return (
    <MainLayout>
      {/* Hero Section */}
      <motion.div 
        className="mb-20 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="bg-primary/95 text-primary-foreground rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden shadow-glow-primary border border-primary/20"
          whileHover={{ y: -5, transition: { duration: 0.3 } }}
        >
          {/* Animated background elements */}
          <motion.div 
            className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full mix-blend-overlay filter blur-3xl opacity-50"
            animate={{ 
              x: [0, 25, -25, 0],
              y: [0, -25, 25, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-50"
            animate={{ 
              x: [0, -25, 25, 0],
              y: [0, 25, -25, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Building The Future Of Learning.
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl mb-10 text-primary-foreground/80 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover, organize, and engage with the best academic resources in one beautiful platform.
            </motion.p>
            
            <motion.div 
              className="flex gap-4 justify-center flex-col sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-background text-foreground rounded-full font-semibold shadow-soft hover:shadow-lg hover:bg-muted transition-all duration-300"
              >
                Start Exploring For Free
              </Link>
              
              <Link
                to="/upload"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 rounded-full font-semibold hover:bg-primary-foreground/20 backdrop-blur-md transition-all duration-300"
              >
                Upload Resource
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {[
          {
            icon: BookOpen,
            title: 'Organized Collections',
            description: 'Keep all your learning materials structured, searchable, and always accessible in seconds.',
            color: 'bg-blue-500/10 text-blue-500',
          },
          {
            icon: Upload,
            title: 'Community Shared',
            description: 'Upload your notes, share with peers, and learn together in an open academic ecosystem.',
            color: 'bg-teal-500/10 text-teal-500',
          },
          {
            icon: Zap,
            title: 'Instant Access',
            description: 'Built on a blazing-fast tech stack ensuring zero noticeable latency when finding exactly what you need.',
            color: 'bg-violet-500/10 text-violet-500',
          },
        ].map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="bg-card border border-border shadow-soft rounded-[2rem] p-8 hover:shadow-md transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}
              >
                <Icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-foreground tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Featured Resources Section */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
              Latest Resources
            </h2>
            <p className="text-muted-foreground">The most recent uploads from the community.</p>
          </div>
          <Link 
            to="/dashboard" 
            className="hidden sm:flex items-center gap-1.5 text-primary font-medium hover:text-primary/80 transition-colors group"
          >
            Explore Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[380px] rounded-2xl overflow-hidden bg-card border border-border">
                <Skeleton className="h-24 w-full rounded-none" />
                <div className="p-5 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="grid grid-cols-4 gap-2 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-between gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-destructive font-medium text-sm">{error}</p>
            </div>
            {isRateLimited && (
              <button
                onClick={() => {
                  setIsRateLimited(false);
                  setError(null);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md hover:bg-destructive/90 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : featuredResources.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {featuredResources.map((resource, idx) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="h-[400px]"
              >
                <ResourceCard 
                  {...resource}
                  uploader_name={`${resource.uploaded_by?.first_name || ''} ${resource.uploaded_by?.last_name || ''}`.trim()}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No resources found"
            description="The community hasn't uploaded anything recently. Be the first to share knowledge!"
            action={{ label: "Upload Resource", onClick: () => window.location.href = '/upload' }}
          />
        )}
        
        <div className="sm:hidden mt-8 text-center bg-card border border-border p-4 rounded-xl shadow-sm">
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center gap-2 text-primary font-medium group"
          >
            Explore All Resources
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </MainLayout>
  );
}

