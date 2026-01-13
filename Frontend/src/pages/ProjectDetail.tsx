import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  DollarSign,
  Clock,
  Users,
  FileText,
  BarChart3,
  Edit,
  Trash2,
  CheckCircle,
  PauseCircle,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { 
  useProject, 
  useProjectSummary, 
  useDeleteProject, 
  useUpdateProject,
  useUpdateProjectStatus
} from '@/hooks/useProjects';
import type { UpdateProjectRequest } from '@/types/project';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: summary, isLoading: summaryLoading } = useProjectSummary(id);
  
  const deleteMutation = useDeleteProject();
  const updateMutation = useUpdateProject();
  const updateStatusMutation = useUpdateProjectStatus();

  const handleDelete = async () => {
    if (id && confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Project deleted successfully');
        navigate('/projects');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleUpdateProject = async (data: UpdateProjectRequest) => {
    if (id) {
      try {
        await updateMutation.mutateAsync({ projectId: id, data });
        toast.success('Project updated successfully');
        setIsFormOpen(false);
      } catch (error) {
        toast.error('Failed to update project');
      }
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (id) {
      try {
        await updateStatusMutation.mutateAsync({ projectId: id, status });
        toast.success(`Project marked as ${status}`);
      } catch (error) {
        toast.error('Failed to update project status');
      }
    }
  };

  if (projectLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (project.status) {
      case 'active': return <Clock className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'on_hold': return <PauseCircle className="h-5 w-5" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/projects')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-lg">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`${getStatusColor()} gap-2 capitalize`}>
                  {getStatusIcon()}
                  {project.status.replace('_', ' ')}
                </Badge>
                {isOverdue && project.status !== 'completed' && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {project.status === 'active' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('completed')}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('on_hold')}
                disabled={updateStatusMutation.isPending}
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                Put On Hold
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setIsFormOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium text-gray-900">{project.clientName}</p>
                      <p className="text-sm text-gray-600">{project.clientContactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Billing Type</p>
                      <p className="font-medium text-gray-900">
                        {project.hourlyRate 
                          ? `Hourly ($${project.hourlyRate}/hr)`
                          : project.fixedPrice
                          ? `Fixed ($${project.fixedPrice})`
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {project.startDate 
                          ? new Date(project.startDate).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className={`font-medium flex items-center gap-1 ${
                        isOverdue && project.status !== 'completed' ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        <Clock className="h-4 w-4" />
                        {project.dueDate 
                          ? new Date(project.dueDate).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {project.description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Description</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                    </div>
                  )}

                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="font-semibold text-gray-900">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <p className="text-sm text-gray-600">Estimated Hours</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {project.totalHours || 0}h
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                        <p className="text-sm text-gray-600">Hours Logged</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {Math.round((project.totalHours || 0) * (project.progress || 0) / 100)}h
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <p className="text-sm text-gray-600">Time Remaining</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {Math.round((project.totalHours || 0) * (100 - (project.progress || 0)) / 100)}h
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              {summary && !summaryLoading && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Cost</span>
                        <span className="font-semibold text-gray-900">
                          ${summary.totalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Amount Invoiced</span>
                        <span className="font-semibold text-emerald-600">
                          ${summary.amountInvoiced.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Amount Paid</span>
                        <span className="font-semibold text-emerald-600">
                          ${summary.amountPaid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium pt-2 border-t">
                        <span className="text-gray-700">Outstanding Balance</span>
                        <span className={`${summary.outstandingBalance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          ${summary.outstandingBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FileText className="h-4 w-4" />
                    Log Time
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <DollarSign className="h-4 w-4" />
                    Create Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FileText className="h-4 w-4" />
                    Add Task
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Users className="h-4 w-4" />
                    Share Project
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Quotes</p>
                        <p className="text-xs text-gray-500">{summary?.quoteCount || 0} total</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Invoices</p>
                        <p className="text-xs text-gray-500">{summary?.invoiceCount || 0} total</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Files</p>
                        <p className="text-xs text-gray-500">{summary?.fileCount || 0} total</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Timeline will appear here once tasks are added</p>
                <Button className="mt-4">Add Timeline Events</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Tasks will appear here once created</p>
                <Button className="mt-4">Add First Task</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Project Form */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleUpdateProject}
        initialData={project}
        mode="edit"
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};