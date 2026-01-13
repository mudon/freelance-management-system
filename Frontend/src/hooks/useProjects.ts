import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/api/projectService';
import type {
  ProjectStats,
  UpdateProjectRequest,
} from '@/types/project';
import { toast } from 'sonner';

export const useProjects = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ['projects', 'paginated', page, size],
    queryFn: () => projectService.getProjectsPaginated(page, size),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllProjects = () => {
  return useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectService.getAllProjects(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProject = (projectId?: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectId ? projectService.getProjectById(projectId) : null,
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useProjectSummary = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-summary', projectId],
    queryFn: () => projectId ? projectService.getProjectSummary(projectId) : null,
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Project created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) =>
      projectService.updateProject(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-summary', variables.projectId] });
      toast.success('Project updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Project deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: string }) =>
      projectService.updateProjectStatus(projectId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Project status updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project status');
    },
  });
};

export const useProjectsByStatus = (status: string) => {
  return useQuery({
    queryKey: ['projects', 'status', status],
    queryFn: () => projectService.getProjectsByStatus(status),
    enabled: !!status,
    staleTime: 1000 * 60 * 5,
  });
};

export const useProjectsByClient = (clientId?: string) => {
  return useQuery({
    queryKey: ['projects', 'client', clientId],
    queryFn: () => clientId ? projectService.getProjectsByClient(clientId) : [],
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchProjects = (query: string) => {
  return useQuery({
    queryKey: ['projects', 'search', query],
    queryFn: () => projectService.searchProjects(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5,
  });
};

export const useExportProjects = () => {
  return useMutation({
    mutationFn: projectService.exportProjectsToCSV,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projects_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Projects exported successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to export projects');
    },
  });
};

export const useImportProjects = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.importProjectsFromCSV,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success(`Successfully imported ${result.success} projects (${result.failed} failed)`);
    },
    onError: (error: any) => {
      toast.error('Failed to import projects');
    },
  });
};

export const useProjectTags = () => {
  return useQuery({
    queryKey: ['project-tags'],
    queryFn: () => projectService.getProjectTags(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentProjects = (limit: number = 5) => {
  return useQuery({
    queryKey: ['projects', 'recent', limit],
    queryFn: () => projectService.getRecentProjects(limit),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpcomingProjects = (limit: number = 5) => {
  return useQuery({
    queryKey: ['projects', 'upcoming', limit],
    queryFn: () => projectService.getUpcomingProjects(limit),
    staleTime: 1000 * 60 * 5,
  });
};

// Add this to your useProjects.ts file:
export const useProjectStats = () => {
  return useQuery({
    queryKey: ['project-stats'],
    queryFn: async (): Promise<ProjectStats> => {
      try {
        // Fetch counts from separate endpoints
        const [
          totalProjectsRes,
          activeCountRes,
          completedCountRes,
          onHoldCountRes,
          overdueProjectsRes,
          allProjectsRes
        ] = await Promise.all([
          projectService.getProjectsCount(),
          projectService.getProjectsCountByStatus('active'),
          projectService.getProjectsCountByStatus('completed'),
          projectService.getProjectsCountByStatus('on_hold'),
          projectService.getOverdueProjects(),
          projectService.getAllProjects()
        ]);

        // Parse responses - backend returns Long
        const totalProjects = Number(totalProjectsRes) || 0;
        const activeProjects = Number(activeCountRes) || 0;
        const completedProjects = Number(completedCountRes) || 0;
        const onHoldProjects = Number(onHoldCountRes) || 0;
        const overdueProjects = Array.isArray(overdueProjectsRes) ? overdueProjectsRes.length : 0;

        // Calculate stats from all projects
        let totalRevenue = 0;
        let totalHours = 0;
        let totalDurationDays = 0;
        let projectsWithDuration = 0;

        allProjectsRes.forEach(project => {
          // Total revenue (from fixed_price or calculated from hourly_rate)
          if (project.fixedPrice) {
            totalRevenue += Number(project.fixedPrice) || 0;
          }
          // Note: You might need to calculate revenue differently based on your business logic

          // Calculate hours if you track time separately
          // For now, we'll use placeholder or skip

          // Calculate duration if start and end dates exist
          if (project.startDate && project.endDate) {
            try {
              const start = new Date(project.startDate);
              const end = new Date(project.endDate);
              const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
              if (duration > 0) {
                totalDurationDays += duration;
                projectsWithDuration++;
              }
            } catch (e) {
              // Invalid date format
            }
          }
        });

        const avgProjectDuration = projectsWithDuration > 0 
          ? Math.round(totalDurationDays / projectsWithDuration) 
          : 0;

        // Note: Since your projects table doesn't have total_hours column,
        // you'll need to calculate this from time tracking if you have it
        const totalHoursCalculated = 0; // Placeholder - implement based on your time tracking

        return {
          totalProjects,
          activeProjects,
          completedProjects,
          onHoldProjects,
          overdueProjects,
          totalRevenue,
          totalHours: totalHoursCalculated,
          avgProjectDuration
        };
      } catch (error) {
        console.error('Error fetching project stats:', error);
        return {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          onHoldProjects: 0,
          overdueProjects: 0,
          totalRevenue: 0,
          totalHours: 0,
          avgProjectDuration: 0
        };
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};