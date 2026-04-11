import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  SortDesc,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import ResourceCard from '../components/ResourceCard';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import resourceService from '../services/resourceService';
import academicService from '../services/academicService';
import { debounce } from '../utils/retryUtils';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tagId') || '');
  const [selectedTagName, setSelectedTagName] = useState(searchParams.get('tagName') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [showFilters, setShowFilters] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);
  const abortControllerRef = useRef(null);

  const resourceTypes = [
    { value: 'notes', label: 'Notes' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'lab_report', label: 'Lab Reports' },
    { value: 'question_bank', label: 'Question Banks' },
    { value: 'textbook', label: 'Textbooks' },
  ];

  const sortOptions = [
    { value: '-created_at', label: 'Newest' },
    { value: '-view_count', label: 'Most Viewed' },
    { value: '-download_count', label: 'Most Downloaded' },
    { value: '-likes_count', label: 'Most Liked' },
  ];

  // Load departments and semesters on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [depts, sems] = await Promise.all([
          academicService.getDepartments(),
          academicService.getSemesters(),
        ]);
        setDepartments(depts);
        setSemesters(sems);
      } catch (err) {
        console.error('Failed to load departments or semesters:', err);
      }
    };
    loadInitialData();
  }, []);

  // Load courses when department changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedDept) {
        setCourses([]);
        return;
      }
      try {
        const cols = await academicService.getDepartmentCourses(selectedDept);
        setCourses(cols);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setCourses([]);
      }
    };
    loadCourses();
  }, [selectedDept]);

  // Fetch resources with all filters
  const fetchResources = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        ordering: sortBy,
        status: 'approved', // Only show approved resources to regular users
      };

      if (searchQuery.trim()) {
        params.search = searchQuery;
      }
      if (selectedDept) {
        params.department = selectedDept;
      }
      if (selectedCourse) {
        params.course = selectedCourse;
      }
      if (selectedSemester) {
        params.semester = selectedSemester;
      }
      if (selectedType) {
        params.resource_type = selectedType;
      }
      if (selectedTag) {
        params.tags = selectedTag;
      }

      const response = await resourceService.getAll(params);
      const filteredResults = (response.results || []).filter(r => r.status === 'approved');
      
      setResources(filteredResults);
      setNextPageUrl(response.next);
      setPrevPageUrl(response.previous);
      setTotalCount(filteredResults.length);
      setCurrentPage(page);
      setIsRateLimited(false); // Clear rate limit on success
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      
      // Check for rate limit
      if (err.response?.status === 429) {
        setIsRateLimited(true);
        const retryAfterSeconds = parseInt(err.response?.data?.detail?.match(/\d+/) || 60);
        setRetryAfter(new Date(Date.now() + retryAfterSeconds * 1000));
        setError(`Server is rate limited. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`);
      } else {
        setError('Failed to load resources. Please try again.');
      }
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept, selectedCourse, selectedSemester, selectedType, sortBy, searchQuery, selectedTag, selectedTagName]);

  // Clear rate limit after retry-after time
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

  // Initial fetch and refetch on filter chaSemester, selectednges
  useEffect(() => {
    fetchResources(1);
  }, [selectedDept, selectedCourse, selectedType, sortBy]);

  // Debounced search handler
  const debouncedSearch = useRef(
    debounce((query) => {
      setSearchQuery(query);
    }, 800)
  ).current;

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setIsLoading(true); // Show loading while debouncing
    debouncedSearch(query);
  };

  // Fetch when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      fetchResources(1);
    }
  }, [searchQuery, selectedTag, fetchResources]);

  // Sync state with URL params
  useEffect(() => {
    const tagId = searchParams.get('tagId');
    const tagName = searchParams.get('tagName');
    if (tagId !== selectedTag) {
      setSelectedTag(tagId || '');
    }
    if (tagName !== selectedTagName) {
      setSelectedTagName(tagName || '');
    }
  }, [searchParams]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDept('');
    setSelectedCourse('');
    setSelectedSemester('');
    setSelectedType('');
    setSortBy('-created_at');
    setSelectedTag('');
    setSelectedTagName('');
    setSearchParams({});
    setIsRateLimited(false); // Reset rate limit flag
    setError(null);
  };

  const hasFilters =
    searchQuery || selectedDept || selectedCourse || selectedSemester || selectedType || selectedTag || sortBy !== '-created_at';

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 mt-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground w-full">
              Discover and explore <span className="font-semibold text-primary">{totalCount > 0 ? totalCount : ''}</span> learning resources
            </p>
          </div>
          <div>
            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-glow-primary transition-all duration-300 transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Upload Resource
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-6 border-border shadow-soft rounded-2xl bg-card">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search resources by title or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-11 h-12 bg-background border-border text-base focus-visible:ring-primary shadow-sm"
            />
          </div>

          {/* Filter Toggle and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-border pt-6">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none gap-2 ${showFilters ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 w-full md:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedTagName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
                    Tag: #{selectedTagName}
                    <button 
                      onClick={() => {
                        setSelectedTag('');
                        setSelectedTagName('');
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('tagId');
                        newParams.delete('tagName');
                        setSearchParams(newParams);
                      }}
                      className="hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 transition-colors"
                    >
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="text-muted-foreground hover:text-foreground text-xs h-8"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Department Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Department
                    </label>
                    <select
                      value={selectedDept}
                      onChange={(e) => {
                        setSelectedDept(e.target.value);
                        setSelectedCourse(''); // Reset course when dept changes
                        setSelectedSemester(''); // Reset semester when dept changes
                      }}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Course ({courses.length} available)
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      disabled={!selectedDept || courses.length === 0}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:bg-muted disabled:text-muted-foreground"
                    >
                      <option value="">All Courses</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.course_code} - {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Semester
                    </label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">All Semesters</option>
                      {semesters.map((sem) => (
                        <option key={sem.id} value={sem.id}>
                          {sem.name} {sem.year} {sem.is_active ? '(Active)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resource Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Resource Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">All Types</option>
                      {resourceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-destructive font-medium">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchResources(currentPage)}
                className="text-destructive hover:bg-destructive/10 -ml-2 mt-1 h-8"
              >
                Try Again →
              </Button>
            </div>
          </div>
          {isRateLimited && (
            <Button
              variant="destructive"
              onClick={() => {
                setIsRateLimited(false);
                setError(null);
                fetchResources(1);
              }}
              title="Force retry even if rate limit is active"
            >
              Force Retry
            </Button>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[400px] overflow-hidden bg-card/60 backdrop-blur-sm border-border flex flex-col">
              <Skeleton className="h-24 w-full rounded-none" />
              <div className="p-5 space-y-4 flex flex-col flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="mt-auto grid grid-cols-4 gap-2 pt-3 border-t border-border">
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && resources.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-6"
        >
          <EmptyState
            icon={Search}
            title="No resources found"
            description={hasFilters ? 'Try adjusting your filters to find what you are looking for' : 'Start by uploading your first resource and sharing it with the community.'}
            action={{ label: "Upload Resource", onClick: () => window.location.href = '/upload' }}
          />
        </motion.div>
      )}

      {/* Resources Grid with Animations */}
      {!isLoading && resources.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {resources.map((resource, idx) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="h-[400px]"
              >
                <ResourceCard
                  {...resource}
                  uploader_name={
                    resource.uploaded_by?.first_name || resource.uploader
                  }
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {(nextPageUrl || prevPageUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 mb-8 pt-8 border-t border-border"
            >
              <div className="text-sm text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{currentPage}</span> • Total:{' '}
                <span className="font-semibold text-foreground">{totalCount} resources</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchResources(currentPage - 1)}
                  disabled={!prevPageUrl || isLoading}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fetchResources(currentPage + 1)}
                  disabled={!nextPageUrl || isLoading}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </MainLayout>
  );
}

