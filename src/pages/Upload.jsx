import MainLayout from '../layouts/MainLayout';
import { Upload as UploadIcon, AlertCircle, Loader, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import academicService from '../services/academicService';
import resourceService from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export default function Upload() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Academic data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'lecture_note',
    file: null,
    department: null,
    course: null,
    semester: null,
    tags: [],
    customTags: '', // For custom tag input
  });

  // UI states
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resourceTypeOptions = [
    { value: 'lecture_note', label: '📝 Lecture Note' },
    { value: 'assignment', label: '📋 Assignment' },
    { value: 'lab_report', label: '🔬 Lab Report' },
    { value: 'question_bank', label: '❓ Question Bank' },
    { value: 'book', label: '📚 Book' },
  ];

  // Load academic data on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadAcademicData = async () => {
      try {
        setIsFetchingData(true);
        const [depts, sems, tags] = await Promise.all([
          academicService.getDepartments(),
          academicService.getSemesters(),
          academicService.getTags(),
        ]);
        setDepartments(depts || []);
        setSemesters(sems || []);
        setAllTags(tags || []);
      } catch (err) {
        console.error('Failed to load academic data:', err);
        setError('Failed to load departments and semesters');
      } finally {
        setIsFetchingData(false);
      }
    };

    loadAcademicData();
  }, [isAuthenticated, navigate]);

  // Load courses when department changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!formData.department) {
        setCourses([]);
        setFormData(prev => ({ ...prev, course: null }));
        return;
      }

      try {
        const cols = await academicService.getDepartmentCourses(formData.department);
        setCourses(cols || []);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setCourses([]);
      }
    };

    loadCourses();
  }, [formData.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: e.target.files[0] });
    } else if (name === 'department') {
      setFormData({ ...formData, department: value ? parseInt(value) : null, course: null });
    } else if (name === 'course') {
      setFormData({ ...formData, course: value ? parseInt(value) : null });
    } else if (name === 'semester') {
      setFormData({ ...formData, semester: value ? parseInt(value) : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleAddCustomTags = () => {
    if (!formData.customTags.trim()) return;
    
    // Split by comma and trim whitespace
    const newTags = formData.customTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !formData.tags.includes(tag));
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ...newTags],
      customTags: '', // Clear input
    }));
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const parseErrorMessages = (errorObj) => {
    if (typeof errorObj === 'string') {
      return errorObj;
    }

    if (Array.isArray(errorObj)) {
      return errorObj.join(', ');
    }

    if (typeof errorObj === 'object' && errorObj !== null) {
      // Handle nested error objects from Django REST
      const messages = [];
      
      if (errorObj.detail) messages.push(errorObj.detail);
      if (errorObj.error) messages.push(errorObj.error);
      if (errorObj.non_field_errors) {
        const nfErrors = Array.isArray(errorObj.non_field_errors) 
          ? errorObj.non_field_errors.join(', ') 
          : errorObj.non_field_errors;
        messages.push(`Validation: ${nfErrors}`);
      }
      if (errorObj.file) {
        const fileErrors = Array.isArray(errorObj.file) ? errorObj.file.join(', ') : errorObj.file;
        messages.push(`File: ${fileErrors}`);
      }
      if (errorObj.title) {
        const titleErrors = Array.isArray(errorObj.title) ? errorObj.title.join(', ') : errorObj.title;
        messages.push(`Title: ${titleErrors}`);
      }
      if (errorObj.description) {
        const descErrors = Array.isArray(errorObj.description) ? errorObj.description.join(', ') : errorObj.description;
        messages.push(`Description: ${descErrors}`);
      }
      if (errorObj.department) {
        const deptErrors = Array.isArray(errorObj.department) ? errorObj.department.join(', ') : errorObj.department;
        messages.push(`Department: ${deptErrors}`);
      }
      if (errorObj.course) {
        const courseErrors = Array.isArray(errorObj.course) ? errorObj.course.join(', ') : errorObj.course;
        messages.push(`Course: ${courseErrors}`);
      }
      if (errorObj.semester) {
        const semErrors = Array.isArray(errorObj.semester) ? errorObj.semester.join(', ') : errorObj.semester;
        messages.push(`Semester: ${semErrors}`);
      }
      if (errorObj.tags) {
        const tagErrors = Array.isArray(errorObj.tags) ? errorObj.tags.join(', ') : errorObj.tags;
        messages.push(`Tags: ${tagErrors}`);
      }
      if (errorObj.resource_type) {
        const typeErrors = Array.isArray(errorObj.resource_type) ? errorObj.resource_type.join(', ') : errorObj.resource_type;
        messages.push(`Resource Type: ${typeErrors}`);
      }

      return messages.length > 0 ? messages.join(' • ') : 'Failed to upload resource. Please try again.';
    }

    return 'Failed to upload resource. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setError('📝 Title is required');
      return;
    }
    if (formData.title.length < 3) {
      setError('📝 Title must be at least 3 characters');
      return;
    }
    if (!formData.description.trim()) {
      setError('📄 Description is required');
      return;
    }
    if (formData.description.length < 10) {
      setError('📄 Description must be at least 10 characters');
      return;
    }
    if (!formData.file) {
      setError('📎 Please select a file to upload');
      return;
    }

    // Validate file size (max 50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (formData.file.size > maxFileSize) {
      setError(`📎 File is too large. Maximum size is 50MB. Your file is ${(formData.file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    if (!formData.department) {
      setError('🏛️ Department is required');
      return;
    }
    if (!formData.course) {
      setError('📚 Course is required');
      return;
    }
    if (!formData.semester) {
      setError('📅 Semester is required');
      return;
    }

    try {
      setIsLoading(true);

      // Create FormData for multipart upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('file', formData.file);
      uploadData.append('resource_type', formData.resource_type);
      uploadData.append('department', formData.department.toString());
      uploadData.append('course', formData.course.toString());
      uploadData.append('semester', formData.semester.toString());

      // Add tags - can be IDs (numbers) or names (strings)
      formData.tags.forEach((tag) => {
        uploadData.append('tags', tag.toString());
      });

      // Upload
      const response = await resourceService.create(uploadData);
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        resource_type: 'lecture_note',
        file: null,
        department: null,
        course: null,
        semester: null,
        tags: [],
        customTags: '',
      });

      // Redirect to profile My Resources tab after 2 seconds
      setTimeout(() => {
        navigate('/profile?tab=resources');
      }, 2000);
    } catch (err) {
      console.error('Upload failed - Full error object:', err);
      const errorMessage = parseErrorMessages(err.error || err.message || err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-16 min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-secondary-foreground font-medium">Preparing upload area...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">Upload Resource</h1>
          <p className="text-muted-foreground text-lg">
            Share your learning materials to help the NoteNest community grow.
          </p>
        </motion.div>

        {/* Success Dialog Overlay */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl shadow-glow-primary p-8 max-w-md w-full text-center relative overflow-hidden"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex justify-center mb-6"
                >
                  <div className="bg-emerald-500/10 rounded-full p-4 flex items-center justify-center">
                    <Check className="w-10 h-10 text-emerald-500" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground mb-3">Upload Successful! 🎉</h2>
                <p className="text-muted-foreground mb-8">
                  Your resource has been uploaded successfully and is pending review by our moderation team.
                </p>

                <div className="bg-muted p-5 rounded-2xl mb-8 text-left border border-border/50">
                  <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Resource Details</p>
                  <div className="space-y-2 text-sm text-secondary-foreground">
                    <p><strong className="text-foreground">Title:</strong> {formData.title}</p>
                    <p><strong className="text-foreground">Type:</strong> {resourceTypeOptions.find(r => r.value === formData.resource_type)?.label}</p>
                    <p><strong className="text-foreground">File:</strong> {formData.file?.name}</p>
                    <p className="pt-2"><Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending Review</Badge></p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full h-12 text-base rounded-xl"
                  >
                    Go to Dashboard
                  </Button>
                  <p className="text-muted-foreground text-xs font-medium">🔄 Redirecting automatically...</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 border border-destructive/20 rounded-2xl shadow-sm p-6 mb-8 relative"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-destructive mb-1">Upload Failed</h3>
                  <p className="text-destructive/90 text-sm leading-relaxed mb-4">{error}</p>
                  <div className="p-3 bg-background/50 rounded-xl border border-destructive/10">
                    <p className="text-xs text-destructive font-mono">
                      Please check the provided information and try again.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="absolute top-4 right-4 text-destructive/60 hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border shadow-soft rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Basic Info Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Basic Information</h3>
                    <p className="text-sm text-muted-foreground mb-4">Provide details to help others find your resource.</p>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-semibold text-foreground">
                      Resource Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Advanced JavaScript Patterns"
                      className="h-12 bg-background border-input focus-visible:ring-primary shadow-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-semibold text-foreground">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Briefly describe what this resource covers..."
                      className="w-full p-4 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all resize-none shadow-sm placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <hr className="border-border" />

                {/* 2. Categorization Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Categorization</h3>
                    <p className="text-sm text-muted-foreground mb-4">Map your resource to the correct academic context.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department */}
                    <div className="space-y-2">
                      <label htmlFor="department" className="text-sm font-semibold text-foreground">
                        Department <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department || ''}
                        onChange={handleChange}
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                      >
                        <option value="">Select a department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Course */}
                    <div className="space-y-2">
                      <label htmlFor="course" className="text-sm font-semibold text-foreground">
                        Course <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="course"
                        name="course"
                        value={formData.course || ''}
                        onChange={handleChange}
                        disabled={!formData.department}
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-muted disabled:text-muted-foreground shadow-sm"
                      >
                        <option value="">
                          {formData.department ? 'Select a course' : 'First select a department'}
                        </option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.course_code} - {course.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Semester */}
                    <div className="space-y-2">
                      <label htmlFor="semester" className="text-sm font-semibold text-foreground">
                        Semester <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester || ''}
                        onChange={handleChange}
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                      >
                        <option value="">Select a semester</option>
                        {semesters.map(sem => (
                          <option key={sem.id} value={sem.id}>
                            {sem.name} {sem.year} {sem.is_active ? '(Active)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resource Type */}
                    <div className="space-y-2">
                      <label htmlFor="resource_type" className="text-sm font-semibold text-foreground">
                        Resource Type <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="resource_type"
                        name="resource_type"
                        value={formData.resource_type}
                        onChange={handleChange}
                        className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                      >
                        {resourceTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                      <span>Tags <span className="text-muted-foreground font-normal ml-1">(Optional)</span></span>
                    </label>
                    <p className="text-xs text-muted-foreground">Add topics to improve searchability.</p>
                    
                    {/* Available Tags Grid */}
                    {allTags.length > 0 && (
                      <div className="mb-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                        <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3">Suggested Topics</p>
                        <div className="flex flex-wrap gap-2">
                          {allTags.map(tag => {
                            const isSelected = formData.tags.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-background border border-border text-secondary-foreground hover:border-primary/50'
                                }`}
                              >
                                {tag.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Custom Tag Input */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={formData.customTags}
                        onChange={(e) => setFormData({ ...formData, customTags: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTags();
                          }
                        }}
                        placeholder="Add your own, separated by commas"
                        className="h-10 bg-background"
                      />
                      <Button
                        type="button"
                        onClick={handleAddCustomTags}
                        disabled={!formData.customTags.trim()}
                        className="h-10 px-4 whitespace-nowrap disabled:opacity-50"
                      >
                        Add
                      </Button>
                    </div>

                    {/* Selected Tags Display */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                        {formData.tags.map((tagId) => {
                          const tagObj = allTags.find(t => t.id === tagId);
                          const tagName = tagObj ? tagObj.name : tagId;
                          return (
                            <Badge
                              key={tagId}
                              variant="secondary"
                              className="px-2 py-1 pr-1 bg-secondary text-secondary-foreground flex items-center gap-1 group border-border/50"
                            >
                              <span className="font-semibold text-xs ml-1">#{tagName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tagId)}
                                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors ml-1"
                                title="Remove tag"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-border" />

                {/* 3. File Upload Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Resource Content</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload the physical file. Maximum size 50MB.</p>
                  </div>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 relative overflow-hidden ${
                      isDragActive
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : formData.file 
                          ? 'border-emerald-500/50 bg-emerald-500/5' 
                          : 'border-border bg-muted/30 hover:border-border/80'
                    }`}
                  >
                    {formData.file ? (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 flex flex-col items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                          <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground mb-1">File Attached Successfully</h4>
                        <p className="font-medium text-primary mb-1 break-all">{formData.file.name}</p>
                        <p className="text-sm text-muted-foreground mb-6 font-mono">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setFormData({ ...formData, file: null })}
                          className="h-9 px-6 rounded-lg text-xs font-semibold"
                        >
                          Choose a different file
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 bg-background shadow-sm border border-border rounded-full flex items-center justify-center mb-6">
                          <UploadIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground mb-2">Drag & Drop to Upload</h4>
                        <p className="text-sm text-muted-foreground mb-6">or click to browse your files</p>
                        <div className="pointer-events-auto">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              name="file"
                              onChange={handleChange}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.txt,.pptx,.xlsx,.jpg,.png,.gif"
                            />
                            <div className="h-11 px-8 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition-colors">
                              Select File
                            </div>
                          </label>
                        </div>
                        <div className="mt-8 pt-4 border-t border-border/50 w-full max-w-xs">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Supported Formats</p>
                          <p className="text-xs text-secondary-foreground mt-2 font-mono">PDF, DOC(X), PPT(X), XLS(X), TXT, Images</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-14 rounded-xl text-base font-bold shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-5 h-5 mr-3 animate-spin" />
                        Processing Upload...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-5 h-5 mr-3" />
                        Submit Resource
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                    className="sm:w-1/3 h-14 rounded-xl text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
