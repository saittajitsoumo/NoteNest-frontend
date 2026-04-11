import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import ResourceCard from '../components/ResourceCard';
import interactionService from '../services/interactionService';
import resourceService from '../services/resourceService';
import { useAuth } from '../context/AuthContext';

export default function Bookmarks() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadBookmarks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await interactionService.getBookmarks();
        
        // Handle paginated response - extract results array
        const bookmarksList = Array.isArray(response) ? response : (response?.results || []);
        console.log('📚 Bookmarks loaded:', bookmarksList);
        
        // For each bookmark, we need to fetch the full resource details
        // The bookmarks might only have resource IDs, so we need to fetch full data
        const enrichedBookmarks = await Promise.all(
          bookmarksList.map(async (bookmark) => {
            try {
              const resource = await resourceService.getById(bookmark.resource);
              return {
                ...bookmark,
                resourceData: resource
              };
            } catch (err) {
              console.error(`Failed to fetch resource ${bookmark.resource}:`, err);
              return bookmark;
            }
          })
        );
        
        setBookmarks(enrichedBookmarks);
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError('Failed to load bookmarks');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [isAuthenticated, navigate]);

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await interactionService.unbookmark(bookmarkId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-8 h-8 text-blue-600 fill-current" />
          <h1 className="text-4xl font-bold text-gray-900">Bookmarks</h1>
        </div>
        <p className="text-gray-600">
          {bookmarks.length} resource{bookmarks.length !== 1 ? 's' : ''} saved for later
        </p>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-6 bg-red-50 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      ) : bookmarks.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {bookmarks.map((bookmark, idx) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleRemoveBookmark(bookmark.id)}
              className="group relative"
            >
              <ResourceCard
                {...(bookmark.resourceData || { id: bookmark.resource })}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveBookmark(bookmark.id);
                }}
                className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="Remove bookmark"
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            You haven't bookmarked any resources yet.
          </p>
          <p className="text-gray-400 text-sm">
            Start exploring and bookmark resources to save them for later.
          </p>
        </motion.div>
      )}
    </MainLayout>
  );
}
