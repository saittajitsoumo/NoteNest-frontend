import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Heart, Bookmark, Download, User, Calendar, BookOpen, AlertCircle, Edit as EditIcon, Trash2, ShieldAlert, Navigation, Flag } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import resourceService from '../services/resourceService';
import interactionService from '../services/interactionService';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Resource state
  const [resource, setResource] = useState(null);
  const [isLoadingResource, setIsLoadingResource] = useState(true);
  const [resourceError, setResourceError] = useState(null);

  // Interaction state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  // Reporting state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);

  // Fetch resource details
  useEffect(() => {
    const fetchResource = async () => {
      try {
        setIsLoadingResource(true);
        setResourceError(null);
        const data = await resourceService.getById(id);
        setResource(data);
        setLikeCount(data.likes_count || 0);
        setDownloadCount(data.download_count || 0);
      } catch (error) {
        console.error('Failed to fetch resource:', error);
        setResourceError(
          error.response?.data?.detail || error.message || 'Failed to load resource'
        );
      } finally {
        setIsLoadingResource(false);
      }
    };

    fetchResource();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        setCommentsError(null);
        const response = await interactionService.getAllComments();
        
        // Extract results array from response object
        const allComments = Array.isArray(response) ? response : (response?.results || []);
        
        // Filter comments for this specific resource
        const resourceComments = allComments.filter((c) => c.resource === parseInt(id));
        
        setComments(resourceComments);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        setCommentsError('Failed to load comments');
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (id) fetchComments();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like resources');
      return;
    }

    setIsLikeLoading(true);
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
      alert('Failed to process like');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      await resourceService.delete(id);
      alert('Resource deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Please login to bookmark resources');
      return;
    }

    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await interactionService.unbookmark(id);
      } else {
        await interactionService.bookmark(id);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Bookmark action failed:', error);
      alert('Failed to process bookmark');
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resource?.file) {
      alert('No file available for download');
      return;
    }

    setIsDownloading(true);
    try {
      // First, increment download count on backend
      try {
        await resourceService.download(id);
        setDownloadCount((prev) => prev + 1);
      } catch (err) {
        console.warn('Failed to increment download count:', err);
        // Continue with download even if count increment fails
      }

      // Then download directly from Cloudinary URL
      const link = document.createElement('a');
      link.href = resource.file;
      link.download = `${resource?.title || 'resource'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download resource');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const data = await interactionService.createComment(id, newComment);
      setComments([data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = async (parentCommentId) => {
    if (!replyText.trim()) return;
    if (!isAuthenticated) {
      alert('Please login to reply');
      return;
    }

    try {
      const data = await interactionService.createComment(id, replyText, parentCommentId);
      setComments([...comments, data]);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await interactionService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      alert('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      setReportMessage({ type: 'error', text: 'Please select a reason' });
      return;
    }

    setIsReporting(true);
    setReportMessage(null);
    try {
      await resourceService.reportResource(id, reportReason, reportDescription);
      setReportMessage({ type: 'success', text: 'Thank you for your report. Our moderators will review it.' });
      setTimeout(() => {
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        setReportMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to report resource:', error);
      setReportMessage({ type: 'error', text: error.error || 'Failed to submit report. Please try again.' });
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoadingResource) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto py-8">
          <Skeleton className="h-12 w-3/4 md:w-1/2 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[500px] w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (resourceError) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8">
          <Card className="p-6 bg-destructive/10 border-destructive/20 flex items-start gap-4 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-destructive flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-destructive mb-1">Error Loading Resource</h3>
              <p className="text-secondary-foreground">{resourceError}</p>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!resource) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto text-center py-20 flex flex-col items-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Resource Not Found</h2>
          <p className="text-muted-foreground">The resource you're looking for doesn't exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div 
        className="max-w-6xl mx-auto pt-6 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">{resource.title}</h1>
          
          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 flex items-center gap-3 bg-card shadow-sm border-border hover:shadow-md transition-shadow">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Uploaded by</p>
                <p className="font-semibold text-foreground truncate">
                  {resource.uploaded_by
                    ? `${resource.uploaded_by.first_name || ''} ${resource.uploaded_by.last_name || ''}`.trim()
                    : 'Unknown'}
                </p>
              </div>
            </Card>
            
            <Card className="p-4 flex items-center gap-3 bg-card shadow-sm border-border hover:shadow-md transition-shadow">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Department</p>
                <p className="font-semibold text-foreground truncate">{resource.department?.name || 'N/A'}</p>
              </div>
            </Card>
            
            <Card className="p-4 flex items-center gap-3 bg-card shadow-sm border-border hover:shadow-md transition-shadow">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Course</p>
                <p className="font-semibold text-foreground truncate">{resource.course?.title || resource.course?.course_code || 'N/A'}</p>
              </div>
            </Card>
            
            <Card className="p-4 flex items-center gap-3 bg-card shadow-sm border-border hover:shadow-md transition-shadow">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Semester</p>
                <p className="font-semibold text-foreground truncate">
                  {resource.semester
                    ? `${resource.semester.name || ''} ${resource.semester.year || ''}`.trim()
                    : 'N/A'}
                </p>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              variant={isLiked ? "secondary" : "outline"}
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`gap-2 h-12 px-6 rounded-xl ${isLiked ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{likeCount} {isLikeLoading ? '...' : 'Like'}</span>
            </Button>

            <Button
              variant={isBookmarked ? "secondary" : "outline"}
              onClick={handleBookmark}
              disabled={isBookmarkLoading}
              className={`gap-2 h-12 px-6 rounded-xl ${isBookmarked ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20' : ''}`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{isBookmarkLoading ? '...' : 'Bookmark'}</span>
            </Button>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">{isDownloading ? 'Downloading...' : 'Download'}</span>
            </Button>

            {/* Report Button - Show for users who are not owners */}
            {isAuthenticated && user?.id !== resource?.uploaded_by?.id && (
              <Button
                variant="outline"
                onClick={() => setShowReportModal(true)}
                className="gap-2 h-12 px-6 rounded-xl border-destructive/20 hover:bg-destructive/10 text-destructive hover:text-destructive"
              >
                <Flag className="w-5 h-5" />
                <span className="font-semibold">Report</span>
              </Button>
            )}

            {/* Edit/Delete Buttons - Show for owner OR admin */}
            {(isAuthenticated && (user?.id === resource?.uploaded_by?.id || user?.role === 'admin' || user?.is_staff)) && (
              <div className="flex gap-3 ml-auto">
                {(user?.id === resource?.uploaded_by?.id) && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/resources/${id}/edit`)}
                    className="gap-2 h-12 px-6 rounded-xl border-primary/20 hover:bg-primary/5 text-primary"
                  >
                    <EditIcon className="w-4 h-4" />
                    <span className="font-semibold">Edit</span>
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={handleDeleteResource}
                  className="gap-2 h-12 px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-semibold">Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Resource Info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Statistics */}
            <Card className="grid grid-cols-3 gap-6 p-8 bg-gradient-to-br from-primary/5 via-background to-indigo-500/5 border border-primary/10 shadow-sm rounded-2xl">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-primary mb-1">{resource.view_count || 0}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Views</p>
              </div>
              <div className="text-center relative">
                <div className="absolute top-1/4 bottom-1/4 left-0 w-px bg-border"></div>
                <p className="text-4xl font-extrabold text-foreground mb-1">{downloadCount}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Downloads</p>
                <div className="absolute top-1/4 bottom-1/4 right-0 w-px bg-border"></div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-extrabold text-foreground mb-1">{resource.comments_count || 0}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Comments</p>
              </div>
            </Card>

            {/* Description */}
            {resource.description && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Overview</h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                    {resource.description}
                  </p>
                </div>
              </div>
            )}

            {/* File Preview or Content */}
            <Card className="bg-muted/30 border border-dashed border-border/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-background shadow-sm border border-border rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Document Preview Unavailable</h3>
              <p className="text-muted-foreground max-w-sm">
                Download the resource directly to your device to view the entire content.
              </p>
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="mt-8 gap-2 px-8 py-6 rounded-xl"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold text-base">{isDownloading ? 'Downloading...' : 'Download Resource'}</span>
              </Button>
            </Card>
          </div>

          {/* Right Column - Comments Section */}
          <div className="lg:col-span-1">
            <Card className="bg-card shadow-md border-border p-6 rounded-2xl sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  Responses
                </h3>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                  {comments.length}
                </span>
              </div>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="mb-6 pb-6 border-b border-border">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full px-4 py-3 bg-muted/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all resize-none text-sm"
                    rows="3"
                  />
                  <div className="flex justify-end mt-3">
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="rounded-lg h-9 px-4 text-sm font-semibold w-full"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Reply'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mb-6 pb-6 border-b border-border p-5 bg-muted/50 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground font-medium mb-3">Join the discussion</p>
                  <Button variant="outline" className="w-full h-9 rounded-lg" onClick={() => navigate('/login')}>
                    Sign in to comment
                  </Button>
                </div>
              )}

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="text-center py-10 space-y-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : commentsError ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
                  {commentsError}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No comments yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.filter(c => !c.parent).map((comment) => {
                    // Handle both cases: user as number (ID) or object with details
                    let authorName = 'Anonymous';
                    let initials = '?';
                    if (comment.user) {
                      if (typeof comment.user === 'number') {
                        authorName = `User #${comment.user}`;
                        initials = 'U';
                      } else if (comment.user.first_name && comment.user.last_name) {
                        authorName = `${comment.user.first_name} ${comment.user.last_name}`;
                        initials = `${comment.user.first_name[0]}${comment.user.last_name[0]}`;
                      } else if (comment.user.username) {
                        authorName = comment.user.username;
                        initials = comment.user.username.substring(0, 2).toUpperCase();
                      }
                    }
                    
                    const replies = comments.filter(c => c.parent === comment.id);
                    
                    return (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="group relative">
                          <div className="flex gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary/80 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-[10px] font-bold text-primary-foreground">{initials}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-foreground truncate">{authorName}</span>
                                <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-secondary-foreground mb-2 leading-relaxed bg-muted/30 p-3 rounded-b-xl rounded-tr-xl border border-border/50">{comment.content}</p>
                              
                              <div className="flex gap-3 mt-1">
                                <button 
                                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                  className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                                >
                                  Reply
                                </button>
                                {isAuthenticated && (
                                  (typeof comment.user === 'number' ? user?.id === comment.user : user?.id === comment.user?.id) ? (
                                    <button 
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-[11px] font-semibold text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      Delete
                                    </button>
                                  ) : null
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="ml-11 mt-4 space-y-4 relative before:absolute before:left-[-19px] before:top-[-10px] before:bottom-4 before:w-px before:bg-border/60">
                            {replies.map((reply, index) => {
                              let replyAuthor = 'Anonymous';
                              let replyInitials = '?';
                              if (reply.user) {
                                if (typeof reply.user === 'number') {
                                  replyAuthor = `User #${reply.user}`;
                                  replyInitials = 'U';
                                } else if (reply.user.first_name && reply.user.last_name) {
                                  replyAuthor = `${reply.user.first_name} ${reply.user.last_name}`;
                                  replyInitials = `${reply.user.first_name[0]}${reply.user.last_name[0]}`;
                                } else if (reply.user.username) {
                                  replyAuthor = reply.user.username;
                                  replyInitials = reply.user.username.substring(0, 2).toUpperCase();
                                }
                              }
                              return (
                                <div key={reply.id} className="relative group">
                                  <div className="absolute -left-5 top-4 w-4 h-px bg-border/60"></div>
                                  <div className="flex gap-2">
                                    <div className="flex-shrink-0 w-6 h-6 bg-muted rounded-full flex items-center justify-center mt-1">
                                      <span className="text-[9px] font-bold text-muted-foreground">{replyInitials}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-xs text-foreground truncate">{replyAuthor}</span>
                                        <span className="text-[10px] text-muted-foreground">{new Date(reply.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-sm text-secondary-foreground leading-relaxed bg-muted/20 px-3 py-2 rounded-xl border border-border/30">{reply.content}</p>
                                      {isAuthenticated && (
                                        (typeof reply.user === 'number' ? user?.id === reply.user : user?.id === reply.user?.id) ? (
                                          <button 
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="text-[10px] font-medium text-muted-foreground hover:text-destructive mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-all"
                                          >
                                            Delete
                                          </button>
                                        ) : null
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply form */}
                        {replyingTo === comment.id && (
                          <div className="ml-11 mt-3">
                            <form onSubmit={(e) => { e.preventDefault(); handleReply(comment.id); }} className="relative">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${authorName}...`}
                                className="w-full pl-3 pr-16 py-2 text-sm bg-muted/30 border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                rows="1"
                                autoFocus
                              />
                              <Button
                                type="submit"
                                disabled={!replyText.trim()}
                                size="sm"
                                className="absolute right-1 top-1 bottom-1 h-auto text-[11px] px-3 font-semibold rounded-md"
                              >
                                Reply
                              </Button>
                            </form>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-destructive/10 text-destructive rounded-2xl">
                  <Flag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Report Content</h2>
                  <p className="text-sm text-muted-foreground">Help us keep NoteNest safe.</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Why are you reporting this?</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-xl bg-secondary/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select a reason</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="spam">Spam</option>
                    <option value="plagiarism">Plagiarism</option>
                    <option value="copyright">Copyright Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>


              </div>

              {reportMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mt-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                    reportMessage.type === 'error' 
                      ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}
                >
                  {reportMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  {reportMessage.text}
                </motion.div>
              )}

              <div className="flex gap-3 justify-end mt-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowReportModal(false)}
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReport}
                  disabled={isReporting}
                  className="rounded-xl px-8 shadow-md hover:shadow-lg transition-all"
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
