import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, File, AlertCircle, Info, ChevronLeft, Save, BookOpen } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import resourceService from '../services/resourceService';
import academicService from '../services/academicService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    course: '',
    semester: '',
    tags: [],
    resource_type: 'lecture_note',
    file: null,
  });

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resource, setResource] = useState(null);
  const [fileName, setFileName] = useState('');

  const resourceTypeOptions = [
    { value: 'lecture_note', label: 'Lecture Note' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'question_bank', label: 'Question Bank' },
    { value: 'book', label: 'Book' },
  ];

  const parseErrorMessages = (errorObj) => {
    if (typeof errorObj === 'string') return errorObj;
    if (Array.isArray(errorObj)) return errorObj.join(', ');
    if (typeof errorObj === 'object' && errorObj !== null) {
      const messages = [];
      if (errorObj.detail) messages.push(errorObj.detail);
      if (errorObj.error) messages.push(errorObj.error);
      if (errorObj.non_field_errors) {
        const nfErrors = Array.isArray(errorObj.non_field_errors) ? errorObj.non_field_errors.join(', ') : errorObj.non_field_errors;
        messages.push(`Validation: ${nfErrors}`);
      }
      if (errorObj.file) messages.push(`File: ${Array.isArray(errorObj.file) ? errorObj.file.join(', ') : errorObj.file}`);
      if (errorObj.title) messages.push(`Title: ${Array.isArray(errorObj.title) ? errorObj.title.join(', ') : errorObj.title}`);
      if (errorObj.description) messages.push(`Description: ${Array.isArray(errorObj.description) ? errorObj.description.join(', ') : errorObj.description}`);
      if (errorObj.department) messages.push(`Department: ${Array.isArray(errorObj.department) ? errorObj.department.join(', ') : errorObj.department}`);
      if (errorObj.course) messages.push(`Course: ${Array.isArray(errorObj.course) ? errorObj.course.join(', ') : errorObj.course}`);
      if (errorObj.semester) messages.push(`Semester: ${Array.isArray(errorObj.semester) ? errorObj.semester.join(', ') : errorObj.semester}`);
      if (errorObj.tags) messages.push(`Tags: ${Array.isArray(errorObj.tags) ? errorObj.tags.join(', ') : errorObj.tags}`);
      return messages.length > 0 ? messages.join(' • ') : 'Failed to update resource. Please try again.';
    }
    return 'Failed to update resource. Please try again.';
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (formData.department) {
      loadCourses();
    } else {
      setCourses([]);
    }
  }, [formData.department]);

  const loadCourses = async () => {
    try {
      const result = await academicService.getDepartmentCourses(formData.department);
      setCourses(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setCourses([]);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await resourceService.getById(id);
      setResource(res);

      if (res.uploaded_by?.id !== user?.id) {
        setError('You do not have permission to edit this resource.');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      setFormData({
        title: res.title || '',
        description: res.description || '',
        department: res.department?.id?.toString() || '',
        course: res.course?.id?.toString() || '',
        semester: res.semester?.id?.toString() || '',
        tags: res.tags?.map(t => t.id) || [],
        resource_type: res.resource_type || 'lecture_note',
        file: null,
      });

      if (res.file) {
        const pathParts = res.file.split('/');
        setFileName(pathParts[pathParts.length - 1]);
      }

      const [deptsData, semesterData, tagsData] = await Promise.all([
        academicService.getDepartments(),
        academicService.getSemesters(),
        academicService.getTags(),
      ]);

      setDepartments(Array.isArray(deptsData) ? deptsData : []);
      setSemesters(Array.isArray(semesterData) ? semesterData : []);
      setAllTags(Array.isArray(tagsData) ? tagsData : []);

      if (res.department?.id) {
        const courseData = await academicService.getDepartmentCourses(res.department.id);
        setCourses(Array.isArray(courseData) ? courseData : []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load resource data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'department' ? { course: '' } : {}),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData(prev => ({
        ...prev,
        file,
      }));
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      setFormData(prev => ({
        ...prev,
        file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (!formData.department) {
      setError('Department is required'); return;
    }
    if (!formData.course) {
      setError('Course is required'); return;
    }
    if (!formData.semester) {
      setError('Semester is required'); return;
    }

    try {
      setIsSaving(true);
      const updateData = new FormData();
      updateData.append('title', formData.title.trim());
      updateData.append('description', formData.description.trim());
      updateData.append('department', formData.department);
      updateData.append('course', formData.course);
      updateData.append('semester', formData.semester);
      updateData.append('resource_type', formData.resource_type);
      
      if (formData.file) {
        updateData.append('file', formData.file);
      }

      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(tagId => {
          updateData.append('tags', tagId);
        });
      }

      const updatedResource = await resourceService.update(id, updateData);
      
      if (resource.status === 'approved' && updatedResource.status === 'pending') {
        setSuccess('⚠️ Resource updated! Status reset to "Pending" for review by a moderator.');
      } else {
        setSuccess('✅ Resource updated successfully!');
      }
      
      setResource(updatedResource);
      setTimeout(() => navigate(`/resources/${id}`), 1500);
    } catch (err) {
      console.error('Update failed:', err);
      setError(parseErrorMessages(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-3 border-muted border-t-primary rounded-full mb-4" />
          <p className="text-muted-foreground font-medium">Loading Resource...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-background to-background py-10 px-4 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-6 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl px-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back to details
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Save className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    Edit Resource
                  </h1>
                </div>
                <p className="text-muted-foreground text-lg ml-13">Enhance and update your shared knowledge</p>
              </div>

              {resource && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Status</span>
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                      resource.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      resource.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      'bg-red-500/10 text-red-600 border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        resource.status === 'approved' ? 'bg-emerald-500' :
                        resource.status === 'pending' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`} />
                      {resource.status}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 25 }}
            onSubmit={handleSubmit}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-10 shadow-xl shadow-primary/5 space-y-8">
                {resource?.status === 'approved' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Info className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-500 flex items-center gap-2">Re-approval Required</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Since this resource is already approved, saving changes will reset it to <span className="text-amber-500 font-bold uppercase text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded italic">Pending</span> for a quick moderator review.
                      </p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-bold text-sm">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400"
                  >
                    <span className="text-xs">✓</span>
                    <p className="font-bold text-sm">{success}</p>
                  </motion.div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-black text-foreground/80 uppercase tracking-widest mb-3 ml-1">
                      Resource Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl bg-background/50 border border-border/50 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg font-medium shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-black text-foreground/80 uppercase tracking-widest mb-3 ml-1">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-6 py-4 rounded-2xl bg-background/50 border border-border/50 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner leading-relaxed"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-black text-foreground/80 uppercase tracking-widest mb-3 ml-1">
                        Type <span className="text-destructive">*</span>
                      </label>
                      <select
                        name="resource_type"
                        value={formData.resource_type}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-2xl bg-background/50 border border-border/50 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none font-bold"
                      >
                        {resourceTypeOptions.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-black text-foreground/80 uppercase tracking-widest mb-3 ml-1">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 min-h-[56px] p-4 rounded-2xl bg-background/50 border border-border/50 shadow-inner">
                        {allTags.length > 0 ? (
                          allTags.map(tag => {
                            const isSelected = formData.tags.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-background border border-border/50 text-muted-foreground hover:border-primary/50'
                                }`}
                              >
                                {tag.name}
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-xs text-muted-foreground italic flex items-center gap-2"><Info className="w-3 h-3" /> No tags available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Desktop) */}
              <div className="hidden lg:flex items-center gap-4">
                <Button type="submit" disabled={isSaving} className="flex-[2] py-8 text-lg font-black tracking-tight rounded-2xl shadow-xl">
                  {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/resources/${id}`)} className="flex-1 py-8 text-lg font-bold rounded-2xl border-2">
                  Cancel
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-foreground uppercase tracking-wider text-sm">Academic Info</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Department</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-xl bg-background/50 border border-border/50 font-bold text-sm">
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Course</label>
                    <select name="course" value={formData.course} onChange={handleInputChange} disabled={!formData.department || courses.length === 0} className="w-full px-5 py-3.5 rounded-xl bg-background/50 border border-border/50 font-bold text-sm disabled:opacity-40">
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.course_code}: {course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Semester</label>
                    <select name="semester" value={formData.semester} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-xl bg-background/50 border border-border/50 font-bold text-sm">
                      <option value="">Select Semester</option>
                      {semesters.map(sem => (
                        <option key={sem.id} value={sem.id}>{sem.name} {sem.year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-foreground uppercase tracking-wider text-sm">Resource File</h3>
                </div>
                <div className="space-y-4">
                  {fileName && (
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
                      <File className="w-6 h-6 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{fileName}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current File</p>
                      </div>
                    </div>
                  )}
                  <div onDragOver={handleDragOver} onDrop={handleDrop} className="relative border-2 border-dashed border-border/50 rounded-2xl p-6 hover:bg-primary/5 transition-all text-center">
                    <input type="file" onChange={handleFileChange} className="hidden" id="file-input" />
                    <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
                      <UploadIcon className="w-7 h-7 text-primary mb-2" />
                      <p className="text-foreground font-bold text-sm">Replace File</p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Mobile Buttons */}
              <div className="flex lg:hidden flex-col gap-3">
                <Button type="submit" disabled={isSaving} className="w-full py-6 text-lg font-black tracking-tight rounded-2xl">
                  {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/resources/${id}`)} className="w-full py-6 text-lg font-bold rounded-2xl border-2">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </MainLayout>
  );
}
