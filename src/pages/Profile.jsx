import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Calendar as CalendarIcon, Settings, LogOut, Lock, Bell, Shield, FileText, CheckCircle, Clock, Trash2, Edit2, Check } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import resourceService from '../services/resourceService';
import ResourceCard from '../components/ResourceCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info'); // 'info', 'resources', or 'settings'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState({
    firstName: authUser?.first_name || '',
    lastName: authUser?.last_name || '',
    username: authUser?.username || '',
    email: authUser?.email || '',
    bio: authUser?.bio || 'Passionate learner and knowledge enthusiast',
    joinDate: authUser?.created_at || new Date().toLocaleDateString(),
    resourcesCount: 0,
  });

  const [formData, setFormData] = useState(profile);
  const [pendingResources, setPendingResources] = useState([]);
  const [approvedResources, setApprovedResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  // Fetch user's pending and approved resources
  useEffect(() => {
    if (activeTab === 'resources') {
      loadUserResources();
    }
  }, [activeTab]);

  const loadUserResources = async () => {
    try {
      setResourcesLoading(true);
      
      // Fetch pending resources - only for current user
      const pendingRes = await resourceService.getAll({
        status: 'pending',
        uploaded_by: authUser?.id,
      });
      const pending = Array.isArray(pendingRes.results) ? pendingRes.results : [];
      
      // Filter to ensure only current user's pending resources
      const userPending = pending.filter(r => r.uploaded_by?.id === authUser?.id && r.status === 'pending');
      setPendingResources(userPending);

      // Fetch approved resources - only for current user
      const approvedRes = await resourceService.getAll({
        status: 'approved',
        uploaded_by: authUser?.id,
      });
      const approved = Array.isArray(approvedRes.results) ? approvedRes.results : [];
      
      // Filter to ensure only current user's approved resources
      const userApproved = approved.filter(r => r.uploaded_by?.id === authUser?.id && r.status === 'approved');
      setApprovedResources(userApproved);
    } catch (err) {
      console.error('Failed to load resources:', err);
      setPendingResources([]);
      setApprovedResources([]);
    } finally {
      setResourcesLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeletePendingResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this pending resource? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await resourceService.deleteResource(resourceId);
      setSuccess('✅ Pending resource deleted successfully!');
      
      // Remove from pending list
      setPendingResources(prev => prev.filter(r => r.id !== resourceId));
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to delete resource. Please try again.');
      console.error('Delete error:', err);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Call API to update profile
      // TODO: Implement API call when backend endpoint is available
      // For now, just update local state
      setProfile(formData);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username || 'User';
  const avatarInitial = fullName.charAt(0).toUpperCase();

  const tabAnim = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Manage your profile aesthetics and preferences</p>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                <div className="bg-emerald-500/20 p-1.5 rounded-full flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-emerald-700 font-medium">{typeof success === 'string' ? success : 'Changes saved successfully'}</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                <div className="bg-destructive/20 p-1.5 rounded-full flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-destructive font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card - Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="rounded-3xl border-border shadow-soft sticky top-24 overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-primary/80 to-indigo-600"></div>
              <CardContent className="pt-0 -mt-12 flex flex-col items-center">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 mb-4 bg-background rounded-full flex items-center justify-center shadow-lg border-4 border-background overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-600 opacity-10"></div>
                  <span className="text-4xl font-extrabold text-primary">{avatarInitial}</span>
                </motion.div>

                {/* Profile Name */}
                <h2 className="text-xl font-bold text-center text-foreground mb-1">{fullName}</h2>
                <p className="text-center text-sm font-medium text-muted-foreground mb-6">@{profile.username}</p>

                {/* Tab Buttons */}
                <div className="w-full space-y-2 mb-6">
                  {[
                    { id: 'info', icon: User, label: 'Profile Info' },
                    { id: 'resources', icon: FileText, label: 'My Resources' },
                    { id: 'settings', icon: Settings, label: 'Settings' }
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={isActive ? 'default' : 'ghost'}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full justify-start h-11 px-4 ${isActive ? 'shadow-md' : 'text-secondary-foreground hover:bg-muted/50'}`}
                      >
                        <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        <span className="font-semibold">{tab.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="w-full pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-11 px-4"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-semibold">Logout</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content - Right Side */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Profile Info Tab */}
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  variants={tabAnim}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="rounded-3xl border-border shadow-soft h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                      <div>
                        <CardTitle className="text-2xl">Personal Information</CardTitle>
                        <CardDescription className="mt-1.5 text-base">Your identity on NoteNest.</CardDescription>
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFormData(profile);
                            setIsEditing(true);
                          }}
                          className="gap-2 h-10 px-4 rounded-xl hidden sm:flex"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="font-semibold">Edit Profile</span>
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-8">
                      {isEditing ? (
                        <form className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                              <label className="text-sm font-semibold text-foreground">
                                First Name
                              </label>
                              <Input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="h-12 bg-background focus-visible:ring-primary shadow-sm"
                              />
                            </motion.div>

                            {/* Last Name */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-2">
                              <label className="text-sm font-semibold text-foreground">
                                Last Name
                              </label>
                              <Input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="h-12 bg-background focus-visible:ring-primary shadow-sm"
                              />
                            </motion.div>
                          </div>

                          {/* Email (Read-only) */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                              Email Address
                            </label>
                            <Input
                              type="email"
                              value={formData.email}
                              disabled
                              className="h-12 disabled:cursor-not-allowed disabled:opacity-75 bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground font-medium flex items-center mt-2 group">
                              <Lock className="w-3 h-3 mr-1 inline opacity-70 group-hover:opacity-100 transition-opacity" /> Contact support to change email
                            </p>
                          </motion.div>

                          {/* Bio */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                              Bio
                            </label>
                            <textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              rows="4"
                              placeholder="Tell us about yourself..."
                              className="w-full p-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all resize-none shadow-sm placeholder:text-muted-foreground"
                            />
                          </motion.div>

                          {/* Action Buttons */}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-3 pt-6 border-t border-border/50">
                            <Button
                              type="button"
                              onClick={handleSaveChanges}
                              disabled={loading}
                              className="h-11 px-6 rounded-xl font-semibold shadow-sm"
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              variant="outline"
                              type="button"
                              onClick={handleCancel}
                              className="h-11 px-6 rounded-xl font-semibold"
                            >
                              Cancel
                            </Button>
                          </motion.div>
                        </form>
                      ) : (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* First Name Display */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-primary" />
                              </div>
                              <div className="pt-1 min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">First Name</p>
                                <p className="text-lg font-semibold text-foreground truncate">{profile.firstName || 'Not set'}</p>
                              </div>
                            </motion.div>

                            {/* Last Name Display */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-indigo-500" />
                              </div>
                              <div className="pt-1 min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Last Name</p>
                                <p className="text-lg font-semibold text-foreground truncate">{profile.lastName || 'Not set'}</p>
                              </div>
                            </motion.div>

                            {/* Email Display */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-emerald-500" />
                              </div>
                              <div className="pt-1 min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Email Address</p>
                                <p className="text-lg font-semibold text-foreground truncate">{profile.email || 'Not set'}</p>
                              </div>
                            </motion.div>

                            {/* Join Date Display */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CalendarIcon className="w-6 h-6 text-purple-500" />
                              </div>
                              <div className="pt-1 min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Member Since</p>
                                <p className="text-lg font-semibold text-foreground truncate">{formatDate(profile.joinDate)}</p>
                              </div>
                            </motion.div>
                          </div>

                          {/* Bio Display */}
                          {profile.bio && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-8 border-t border-border/50">
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Bio</p>
                              <p className="text-secondary-foreground leading-relaxed p-4 bg-muted/30 rounded-xl border border-border/50">{profile.bio}</p>
                            </motion.div>
                          )}

                          <Button
                            variant="secondary"
                            onClick={() => {
                              setFormData(profile);
                              setIsEditing(true);
                            }}
                            className="w-full sm:hidden"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  variants={tabAnim}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <Card className="rounded-3xl border-border shadow-soft overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Security & Privacy</CardTitle>
                          <CardDescription>Manage your account security and visibility</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-border/50">
                      <div className="p-6 hover:bg-muted/20 transition-colors flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Change Password</p>
                          <p className="text-sm text-muted-foreground mt-1">Update your password to keep your account secure</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/change-password')}>Update</Button>
                      </div>
                      
                      <div className="p-6 hover:bg-muted/20 transition-colors flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Public Profile Privacy</p>
                          <p className="text-sm text-muted-foreground mt-1">Make your profile discoverable to other users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-border shadow-soft overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                          <Bell className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Notification Preferences</CardTitle>
                          <CardDescription>Control how and when you receive alerts</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-border/50">
                      <div className="p-6 hover:bg-muted/20 transition-colors flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Email Updates</p>
                          <p className="text-sm text-muted-foreground mt-1">Receive weekly digests and platform announcements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="p-6 hover:bg-muted/20 transition-colors flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Resource Interaction Alerts</p>
                          <p className="text-sm text-muted-foreground mt-1">Notify me when someone likes or comments on my resources</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <motion.div
                  key="resources"
                  variants={tabAnim}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="rounded-2xl border-border shadow-sm border-t-4 border-t-amber-500 overflow-hidden relative">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -z-10"></div>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-14 h-14 bg-background border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-sm text-amber-500">
                          <Clock className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">In Review</p>
                          <p className="text-3xl font-extrabold text-foreground">{pendingResources.length}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm border-t-4 border-t-emerald-500 overflow-hidden relative">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -z-10"></div>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-14 h-14 bg-background border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-sm text-emerald-500">
                          <CheckCircle className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Published</p>
                          <p className="text-3xl font-extrabold text-foreground">{approvedResources.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pending Resources Section */}
                  <Card className="rounded-3xl border-border shadow-soft overflow-hidden">
                    <CardHeader className="bg-amber-500/5 pb-6 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-amber-600" />
                          <CardTitle className="text-lg text-amber-900 dark:text-amber-500">Pending Review</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-background text-amber-600 border-amber-500/30 font-bold">{pendingResources.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {resourcesLoading ? (
                        <div className="space-y-4 py-4">
                           {[...Array(2)].map((_, i) => (
                             <Skeleton key={i} className="h-28 w-full rounded-xl" />
                           ))}
                        </div>
                      ) : pendingResources.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6" />
                          </div>
                          <p className="font-medium">All caught up!</p>
                          <p className="text-sm mt-1">You have no resources pending review.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {pendingResources.map((resource) => (
                            <motion.div
                              key={resource.id}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="group p-5 border border-border bg-card rounded-xl hover:border-amber-500/50 hover:shadow-md transition-all relative overflow-hidden"
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 pr-4">
                                  <h4 className="font-bold text-foreground text-lg mb-1 truncate">{resource.title}</h4>
                                  <p className="text-sm text-secondary-foreground line-clamp-2 mb-3">{resource.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>
                                    <Badge variant="outline" className="text-xs">{resource.resource_type}</Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeletePendingResource(resource.id)}
                                  disabled={loading}
                                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete this pending resource"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Approved Resources Section */}
                  <div className="pt-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Published Content</h3>
                      <Badge variant="secondary" className="ml-auto bg-muted">
                        {approvedResources.length} Total
                      </Badge>
                    </div>

                    {resourcesLoading ? (
                      <div className="grid grid-cols-1 gap-6">
                         {[...Array(2)].map((_, i) => (
                           <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                         ))}
                      </div>
                    ) : approvedResources.length === 0 ? (
                      <EmptyState 
                        icon={FileText}
                        title="No Published Resources"
                        description="Materials you've shared that have been approved will appear here."
                        action={{ label: "Upload Resource", onClick: () => navigate('/upload') }}
                      />
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {approvedResources.map((resource) => (
                          <ResourceCard key={resource.id} {...resource} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
