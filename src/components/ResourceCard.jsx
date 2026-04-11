import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Heart, Download, Eye, MessageCircle, ArrowRight, Flag } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import interactionService from '../services/interactionService';
import resourceService from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import {
  formatAuthorName,
  formatDate,
  formatCount,
  truncateText,
  getResourceTypeStyle,
  getStatusStyle,
} from '../utils/formatters';

export default function ResourceCard({
  id,
  title,
  description,
  uploaded_by,
  department,
  course,
  semester,
  resource_type = 'notes',
  status = 'approved',
  view_count = 0,
  download_count = 0,
  likes_count = 0,
  comments_count = 0,
  bookmarks_count = 0,
  tags = [],
  created_at,
  file = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user to check if owner
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null); // Track bookmark ID for deletion
  const [isLikingLoading, setIsLikingLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [likeCount, setLikeCount] = useState(likes_count);
  const [downloadCountState, setDownloadCountState] = useState(download_count);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);

  const resourceTypeStyle = getResourceTypeStyle(resource_type);
  const statusStyle = getStatusStyle(status);
  const authorName = formatAuthorName(uploaded_by);
  const deptName = department?.name || 'Unknown';
  const courseCode = course?.course_code || '';

  const handleLike = async (e) => {
    e.preventDefault();
    setIsLikingLoading(true);
    try {
      if (isLiked) {
        await interactionService.unlike(id);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await interactionService.like(id);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Like action failed:', error);
    } finally {
      setIsLikingLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    setIsBookmarkLoading(true);
    try {
      if (isBookmarked && bookmarkId) {
        await interactionService.unbookmark(bookmarkId);
        setBookmarkId(null);
      } else {
        const response = await interactionService.bookmark(id);
        setBookmarkId(response.id); // Store the bookmark ID for future removal
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Bookmark action failed:', error);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    
    // If no file URL, show error
    if (!file) {
      console.error('No file available for download');
      return;
    }

    setIsDownloading(true);
    try {
      // First, increment download count on backend
      try {
        await resourceService.download(id);
        setDownloadCountState((prev) => prev + 1);
      } catch (err) {
        console.warn('Failed to increment download count:', err);
        // Continue with download even if count increment fails
      }

      // Then download directly from file URL
      const link = document.createElement('a');
      link.href = file;
      link.download = `${title || 'resource'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      setReportMessage({ type: 'error', text: 'Please select a reason' });
      return;
    }
    try {
      setIsReporting(true);
      await resourceService.reportResource(id, reportReason, reportDescription);
      setReportMessage({ type: 'success', text: '✅ Resource reported successfully! Admin will review it.' });
      setTimeout(() => {
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        setReportMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Report failed:', error);
      setReportMessage({ type: 'error', text: 'Failed to report resource. Please try again.' });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <>
      <Link to={`/resources/${id}`} className="block h-full relative group">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="h-full flex"
        >
          <Card className="h-full flex flex-col flex-1 overflow-hidden border-border/60 hover:border-primary/40 group-hover:shadow-xl dark:group-hover:shadow-primary/5 transition-all duration-300">
            {/* ── Gradient Header ── */}
            <div className="relative h-32 flex items-end justify-between px-5 pb-4 shrink-0 overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 dark:from-indigo-700 dark:via-blue-800 dark:to-violet-900">
              {/* Mesh blobs */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/15 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              </div>

              {/* Dept + Course */}
              <div className="relative z-10 flex-1 pr-4 min-w-0">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em] mb-1 truncate">
                  {deptName}
                </p>
                <p className="text-white text-xl font-extrabold tracking-tight truncate drop-shadow-sm">
                  {courseCode}
                </p>
              </div>

              {/* Type Badge — high contrast pill */}
              <div className="relative z-10 flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 text-indigo-700 shadow-lg backdrop-blur-sm dark:bg-white/90 dark:text-indigo-800">
                  {resourceTypeStyle.icon}
                  <span className="capitalize">{resource_type.replace(/_/g, ' ')}</span>
                </span>
                {status !== 'approved' && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                    status === 'pending'
                      ? 'bg-amber-400/90 text-amber-950'
                      : status === 'rejected'
                      ? 'bg-red-400/90 text-red-950'
                      : 'bg-white/90 text-zinc-800'
                  }`}>
                    {statusStyle.icon}
                    <span>{statusStyle.text}</span>
                  </span>
                )}
              </div>
            </div>

            {/* ── Content ── */}
            <div className="p-5 flex-grow flex flex-col bg-card">
              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
                {truncateText(description, 100)}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4 shrink-0">
                {tags && tags.length > 0 ? (
                  <>
                    {tags.slice(0, 3).map(tag => (
                      <button
                        key={tag.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/dashboard?tagId=${tag.id}&tagName=${tag.name}`);
                        }}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/15 dark:border-indigo-500/25 hover:bg-indigo-500/20 transition-colors z-30 relative"
                      >
                        #{tag.name}
                      </button>
                    ))}
                    {tags.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-muted text-muted-foreground">
                        +{tags.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted text-transparent select-none">
                    #none
                  </span>
                )}
              </div>

              {/* Uploader & Date Info */}
              <div className="pb-3 mb-3 border-b border-border/50 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-background shrink-0">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-none mb-0.5 truncate">{authorName}</p>
                  {created_at && (
                    <p className="text-[11px] text-muted-foreground leading-none">{formatDate(created_at)}</p>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-1 mb-4 shrink-0">
                <div className="text-center group/stat py-1.5 rounded-lg hover:bg-blue-500/5 transition-colors cursor-default">
                  <Eye className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1 group-hover/stat:scale-110 transition-transform" />
                  <p className="text-[11px] font-bold text-foreground">{formatCount(view_count)}</p>
                </div>
                <div className="text-center group/stat py-1.5 rounded-lg hover:bg-emerald-500/5 transition-colors cursor-default">
                  <Download className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1 group-hover/stat:scale-110 transition-transform" />
                  <p className="text-[11px] font-bold text-foreground">{formatCount(downloadCountState)}</p>
                </div>
                <div className="text-center group/stat py-1.5 rounded-lg hover:bg-rose-500/5 transition-colors cursor-default">
                  <Heart className="w-3.5 h-3.5 text-rose-500 mx-auto mb-1 group-hover/stat:scale-110 transition-transform" />
                  <p className="text-[11px] font-bold text-foreground">{formatCount(likeCount)}</p>
                </div>
                <div className="text-center group/stat py-1.5 rounded-lg hover:bg-violet-500/5 transition-colors cursor-default">
                  <MessageCircle className="w-3.5 h-3.5 text-violet-500 mx-auto mb-1 group-hover/stat:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-foreground">{formatCount(comments_count)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="grid grid-cols-4 gap-2 pt-2 shrink-0 relative z-20"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <Button
                  variant={isLiked ? "secondary" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLike(e);
                  }}
                  disabled={isLikingLoading}
                  className={`px-0 h-9 font-medium ${isLiked ? 'text-rose-600 bg-rose-500/15 hover:bg-rose-500/25' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Heart className={`w-[14px] h-[14px] mr-1.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline text-xs">Like</span>
                </Button>

                <Button
                  variant={isBookmarked ? "secondary" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBookmark(e);
                  }}
                  disabled={isBookmarkLoading}
                  className={`px-0 h-9 font-medium ${isBookmarked ? 'text-amber-600 bg-amber-500/15 hover:bg-amber-500/25' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Bookmark className={`w-[14px] h-[14px] mr-1.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline text-xs">Save</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(e);
                  }}
                  disabled={isDownloading}
                  className="px-0 h-9 font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/15"
                >
                  <Download className="w-[14px] h-[14px] mr-1.5" />
                  <span className="hidden sm:inline text-xs">Get</span>
                </Button>

                {/* Report Button */}
                {user?.id !== uploaded_by?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowReportModal(true);
                    }}
                    className="px-0 h-9 font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/15"
                  >
                    <Flag className="w-[14px] h-[14px] mr-1.5" />
                    <span className="hidden sm:inline text-xs">Report</span>
                  </Button>
                )}
              </div>

              {/* View Details */}
              <div
                className="w-full mt-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn shrink-0 cursor-pointer border border-primary/20 hover:border-primary shadow-sm hover:shadow-md"
              >
                View Details
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>
        </motion.div>
      </Link>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-foreground mb-4">Report Resource</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="plagiarism">Plagiarism</option>
                  <option value="copyright">Copyright Violation</option>
                  <option value="other">Other</option>
                </select>
              </div>



              {reportMessage && (
                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${
                  reportMessage.type === 'error' 
                    ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {reportMessage.text}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowReportModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReport}
                  disabled={isReporting}
                >
                  {isReporting ? 'Reporting...' : 'Submit Report'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}