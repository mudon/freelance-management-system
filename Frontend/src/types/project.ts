export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type ProjectBillingType = 'hourly' | 'fixed';

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  clientContactName: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  hourlyRate?: number;
  fixedPrice?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  tags?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  totalHours?: number;
  totalCost?: number;
  amountInvoiced?: number;
  amountPaid?: number;
  outstandingBalance?: number;
  progress?: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: ProjectStatus;
  clientName: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  totalHours: number;
  totalCost: number;
  amountInvoiced: number;
  amountPaid: number;
  outstandingBalance: number;
  quoteCount: number;
  invoiceCount: number;
  fileCount: number;
  progress: string;
  isOverdue: boolean;
}

export interface CreateProjectRequest {
  clientId: string;
  name: string;
  description?: string;
  hourlyRate?: number;
  fixedPrice?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateProjectRequest {
  clientId?: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  hourlyRate?: number;
  fixedPrice?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  tags?: string[];
}

export interface ProjectsResponse {
  content: Project[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  overdueProjects: number;
  totalRevenue: number;
  totalHours: number;
  avgProjectDuration: number;
}