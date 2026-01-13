import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Filter, 
  Search, 
  Download, 
  Upload, 
  RefreshCw,
  Calendar,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/common/DataTable';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { 
  useProjects, 
  useProjectStats, 
  useCreateProject, 
  useUpdateProject,
  useDeleteProject,
  useUpdateProjectStatus,
  useExportProjects,
  useImportProjects,
  useProjectTags
} from '@/hooks/useProjects';
import type { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest 
} from '@/types/project';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // API Hooks
  const { data: projectsData, isLoading, refetch } = useProjects(page, pageSize);
  const { data: stats, isLoading: statsLoading } = useProjectStats();
  const { data: tags } = useProjectTags();
  
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const updateStatusMutation = useUpdateProjectStatus();
  const exportMutation = useExportProjects();
  const importMutation = useImportProjects();

  // Get projects array from paginated response
  const projects = projectsData?.content || [];

  // Filter projects based on active tab and search
  const filteredProjects = useMemo(() => {    
    let filtered = projects;
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(p => p.status === 'active');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(p => p.status === 'completed');
    } else if (activeTab === 'on_hold') {
      filtered = filtered.filter(p => p.status === 'on_hold');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(p => p.status === 'cancelled');
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter(p => 
        p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'completed'
      );
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && selectedTags.some(tag => p.tags!.includes(tag))
      );
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [projects, activeTab, selectedTags, searchQuery]);

  const handleCreateProject = async (data: CreateProjectRequest) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdateProject = async (data: UpdateProjectRequest) => {
    if (!selectedProject) return;
    await updateMutation.mutateAsync({ projectId: selectedProject.id, data });
    setIsFormOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(projectId);
    }
  };

  const handleUpdateStatus = async (projectId: string, status: string) => {
    await updateStatusMutation.mutateAsync({ projectId, status });
  };

  const handleExportProjects = async () => {
    await exportMutation.mutateAsync();
  };

  const handleImportProjects = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importMutation.mutateAsync(file);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Calculate display ranges for pagination
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, projectsData?.totalElements || 0);

  // Table columns configuration
  const columns: ColumnDef<Project>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Project',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.original.name}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.clientName}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'clientName',
      header: 'Client',
      cell: ({ row }) => (
        <div className="text-gray-700">
          {row.original.clientName}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const getStatusIcon = () => {
          switch (row.original.status) {
            case 'active': return <Target className="h-3 w-3" />;
            case 'completed': return <CheckCircle className="h-3 w-3" />;
            case 'on_hold': return <PauseCircle className="h-3 w-3" />;
            case 'cancelled': return <XCircle className="h-3 w-3" />;
            default: return null;
          }
        };

        const getStatusColor = () => {
          switch (row.original.status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'on_hold': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
          }
        };

        return (
          <Badge className={`${getStatusColor()} capitalize gap-1`}>
            {getStatusIcon()}
            {row.original.status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'billing',
      header: 'Billing',
      cell: ({ row }) => (
        <div className="text-gray-700 font-medium">
          {row.original.hourlyRate 
            ? `$${row.original.hourlyRate}/hr`
            : row.original.fixedPrice
            ? `$${row.original.fixedPrice}`
            : 'Not set'}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {row.original.dueDate 
            ? new Date(row.original.dueDate).toLocaleDateString()
            : 'Not set'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${row.original.id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProject(row.original);
              setIsFormOpen(true);
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-gray-600 mt-2">
                Track your ongoing and completed work
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportProjects}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <div>
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportProjects}
                />
              </div>
            </Button>
          </label>
          <Button 
            onClick={() => {
              setSelectedProject(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {statsLoading ? '...' : stats?.totalProjects || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">across all clients</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">
                  {statsLoading ? '...' : stats?.activeProjects || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">in progress</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {statsLoading ? '...' : stats?.overdueProjects || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">past due date</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-400">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-purple-50/50 to-pink-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  ${statsLoading ? '...' : stats?.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">estimated value</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          </div>

          {/* Tags Filter */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Filter by tags:</span>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="all" className="rounded-md">
            All Projects
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-md">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-md">
            Completed
          </TabsTrigger>
          <TabsTrigger value="on_hold" className="rounded-md">
            On Hold
          </TabsTrigger>
          <TabsTrigger value="overdue" className="rounded-md">
            Overdue
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mt-4 text-gray-600">
                    {searchQuery || selectedTags.length > 0
                      ? 'No projects found matching your criteria'
                      : 'No projects found'}
                  </p>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onView={(project) => navigate(`/projects/${project.id}`)}
                      onEdit={(project) => {
                        setSelectedProject(project);
                        setIsFormOpen(true);
                      }}
                      onDelete={handleDeleteProject}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <DataTable
              data={filteredProjects}
              columns={columns}
              onAdd={() => setIsFormOpen(true)}
              addLabel="New Project"
            />
          )}

          {/* Pagination */}
          {!searchQuery && !selectedTags.length && projectsData && projectsData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {endIndex} of {projectsData.totalElements} projects
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, projectsData.totalPages) }, (_, i) => {
                    let pageNum = i;
                    if (projectsData.totalPages > 5) {
                      if (page < 3) pageNum = i;
                      else if (page > projectsData.totalPages - 3) pageNum = projectsData.totalPages - 5 + i;
                      else pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= projectsData.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={async (data) => {
          if (selectedProject) {
            await handleUpdateProject(data as UpdateProjectRequest);
          } else {
            await handleCreateProject(data as CreateProjectRequest);
          }
        }}
        initialData={selectedProject || undefined}
        mode={selectedProject ? 'edit' : 'create'}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};