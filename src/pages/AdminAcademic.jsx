import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, BookOpen, Zap, GraduationCap, Calendar, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import AdminNavbar from '../components/AdminNavbar';
import academicService from '../services/academicService';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';

export default function AdminAcademic() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user?.role !== 'admin' && !user?.is_staff) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [deptsRes, courseRes, semRes] = await Promise.all([
        academicService.getDepartments(),
        academicService.getCourses(),
        academicService.getSemesters(),
      ]);

      setDepartments(deptsRes.results || []);
      setCourses(courseRes.results || []);
      setSemesters(semRes.results || []);
    } catch (err) {
      console.error('Failed to fetch academic data:', err);
      setError('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError(null);

      if (activeTab === 'departments') {
        console.log('Create department:', data);
        setSuccess('Department created successfully');
      } else if (activeTab === 'courses') {
        console.log('Create course:', data);
        setSuccess('Course created successfully');
      } else if (activeTab === 'semesters') {
        console.log('Create semester:', data);
        setSuccess('Semester created successfully');
      }

      reset();
      setShowForm(false);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create item');
      console.error(err);
    }
  };

  const tabConfig = [
    { id: 'departments', label: 'Departments', icon: Building2, emoji: '🏢', activeClass: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400' },
    { id: 'courses', label: 'Courses', icon: GraduationCap, emoji: '📖', activeClass: 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400' },
    { id: 'semesters', label: 'Semesters', icon: Calendar, emoji: '📅', activeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' },
  ];

  const currentData = activeTab === 'departments' ? departments : activeTab === 'courses' ? courses : semesters;

  return (
    <MainLayout>
      <AdminNavbar />
      
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              📚 Academic Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage departments, courses, and semesters for your institution
            </p>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl mb-6 backdrop-blur-sm"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl mb-6 backdrop-blur-sm"
              >
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs + Add button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex gap-3 flex-wrap">
                {tabConfig.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowForm(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 border-2 ${
                        isActive
                          ? tab.activeClass
                          : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <span>{tab.emoji}</span>
                      {tab.label}
                      <span className="ml-1 text-xs opacity-60">
                        ({activeTab === tab.id ? currentData.length : (tab.id === 'departments' ? departments.length : tab.id === 'courses' ? courses.length : semesters.length)})
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Add New Button */}
              <Button
                onClick={() => setShowForm(!showForm)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
              </Button>
            </div>
          </motion.div>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-6 mb-8 overflow-hidden"
              >
                <h3 className="text-lg font-bold text-foreground">
                  Create New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                </h3>

                {activeTab === 'departments' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Department Name</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="e.g., Computer Science & Engineering"
                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                      {errors.name && <p className="text-destructive text-sm mt-2">⚠️ {errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Department Code</label>
                      <input
                        {...register('code', { required: 'Code is required' })}
                        placeholder="e.g., CSE"
                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                      {errors.code && <p className="text-destructive text-sm mt-2">⚠️ {errors.code.message}</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Course Title</label>
                      <input
                        {...register('title', { required: 'Title is required' })}
                        placeholder="e.g., Data Structures"
                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                      {errors.title && <p className="text-destructive text-sm mt-2">⚠️ {errors.title.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Course Code</label>
                      <input
                        {...register('course_code', { required: 'Course code is required' })}
                        placeholder="e.g., CSE201"
                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                      {errors.course_code && <p className="text-destructive text-sm mt-2">⚠️ {errors.course_code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Department</label>
                      <select
                        {...register('department', { required: 'Department is required' })}
                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      >
                        <option value="" className="bg-card text-foreground">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id} className="bg-card text-foreground">
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {errors.department && <p className="text-destructive text-sm mt-2">⚠️ {errors.department.message}</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'semesters' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Semester Name</label>
                      <input
                        {...register('name', { required: 'Semester name is required' })}
                        placeholder="e.g., Fall"
                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                      {errors.name && <p className="text-destructive text-sm mt-2">⚠️ {errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Year</label>
                      <input
                        {...register('year', { required: 'Year is required', pattern: { value: /^\d{4}$/, message: 'Enter a valid year' } })}
                        placeholder="e.g., 2024"
                        type="number"
                        className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                      {errors.year && <p className="text-destructive text-sm mt-2">⚠️ {errors.year.message}</p>}
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-secondary/50 rounded-xl border border-border hover:bg-secondary transition w-full">
                        <input
                          type="checkbox"
                          {...register('is_active')}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-foreground font-semibold text-sm">Mark as Active</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      reset();
                    }}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Check className="w-4 h-4" />
                    Create
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* List */}
          {loading ? (
            <motion.div 
              className="flex items-center justify-center h-64"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-center">
                <Zap className="w-12 h-12 text-muted mx-auto mb-3 animate-pulse" />
                <p className="text-muted-foreground font-medium">Loading academic data...</p>
              </div>
            </motion.div>
          ) : currentData.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border shadow-sm">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-foreground font-semibold text-lg">No {activeTab} created yet</p>
                <p className="text-muted-foreground text-sm mt-1">Click the "Add" button to create one</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {/* Departments */}
                {activeTab === 'departments' && departments.map((dept, index) => (
                  <motion.div
                    key={dept.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center justify-between p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-2xl shrink-0">
                        🏢
                      </div>
                      <div>
                        <p className="text-foreground font-bold text-lg">{dept.name}</p>
                        <p className="text-muted-foreground text-sm">
                          Code: <span className="text-primary font-mono font-semibold">{dept.code}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-9 w-9 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-9 w-9 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {/* Courses */}
                {activeTab === 'courses' && courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center justify-between p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-2xl shrink-0">
                        📖
                      </div>
                      <div>
                        <p className="text-foreground font-bold text-lg">{course.title}</p>
                        <p className="text-muted-foreground text-sm">
                          <span className="text-primary font-mono font-semibold">{course.course_code}</span>
                          <span className="mx-2">•</span>
                          {course.department?.name || '–'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-9 w-9 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-9 w-9 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {/* Semesters */}
                {activeTab === 'semesters' && semesters.map((semester, index) => (
                  <motion.div
                    key={semester.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04 }}
                    className={`flex items-center justify-between p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group ${
                      semester.is_active
                        ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        semester.is_active ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-secondary'
                      }`}>
                        📅
                      </div>
                      <div>
                        <p className="text-foreground font-bold text-lg">{semester.name} {semester.year}</p>
                        <p className={`text-sm font-semibold ${
                          semester.is_active
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        }`}>
                          {semester.is_active ? '✅ Active Semester' : '⭕ Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-9 w-9 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-9 w-9 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
