import api from '@/lib/axios';
import type {
  Project,
  ProjectSummary,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectsResponse,
  ProjectStats
} from '@/types/project';

export const projectService = {
  // Get all projects with pagination
  getProjectsPaginated: async (page: number = 0, size: number = 20): Promise<ProjectsResponse> => {
    const response = await api.get(`/user/projects/paginated`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get('/user/projects');
    return response.data;
  },

  // Get project by ID
  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await api.get(`/user/projects/${projectId}`);
    return response.data;
  },

  // Create project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post('/user/projects', data);
    return response.data;
  },

  // Update project
  updateProject: async (projectId: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put(`/user/projects/${projectId}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    await api.delete(`/user/projects/${projectId}`);
  },

  // Update project status
  updateProjectStatus: async (projectId: string, status: string): Promise<Project> => {
    const response = await api.patch(`/user/projects/${projectId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Get projects by status
  getProjectsByStatus: async (status: string): Promise<Project[]> => {
    const response = await api.get(`/user/projects/status/${status}`);
    return response.data;
  },

  // Get projects by client
  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    const response = await api.get(`/user/projects/client/${clientId}`);
    return response.data;
  },

  // Search projects
  searchProjects: async (query: string): Promise<Project[]> => {
    const response = await api.get(`/user/projects/search`, {
      params: { query }
    });
    return response.data;
  },

  // Get project summary
  getProjectSummary: async (projectId: string): Promise<ProjectSummary> => {
    const response = await api.get(`/user/projects/${projectId}/summary`);
    return response.data;
  },

  // Get overdue projects
  getOverdueProjects: async (): Promise<Project[]> => {
    const response = await api.get('/user/projects/overdue');
    return response.data;
  },

  // Get projects by due date range
  getProjectsByDueDateRange: async (startDate: string, endDate: string): Promise<Project[]> => {
    const response = await api.get('/user/projects/due-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get projects by tag
  getProjectsByTag: async (tag: string): Promise<Project[]> => {
    const response = await api.get(`/user/projects/tag/${tag}`);
    return response.data;
  },

  // Get all project tags
  getProjectTags: async (): Promise<string[]> => {
    const response = await api.get('/user/projects/tags');
    return response.data;
  },

  // Get projects count
  getProjectsCount: async (): Promise<number> => {
    const response = await api.get('/user/projects/count');
    return response.data;
  },

  // Get projects count by status
  getProjectsCountByStatus: async (status: string): Promise<number> => {
    const response = await api.get(`/user/projects/count/status/${status}`);
    return response.data;
  },

  // Get recent projects
  getRecentProjects: async (limit: number = 5): Promise<Project[]> => {
    const response = await api.get('/user/projects/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Get upcoming projects
  getUpcomingProjects: async (limit: number = 5): Promise<Project[]> => {
    const response = await api.get('/user/projects/upcoming', {
      params: { limit }
    });
    return response.data;
  },

  // Export projects to CSV
  exportProjectsToCSV: async (): Promise<Blob> => {
    const response = await api.get('/user/projects/export', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Import projects from CSV
  importProjectsFromCSV: async (file: File): Promise<{ success: number; failed: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/user/projects/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};