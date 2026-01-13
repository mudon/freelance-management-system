// src/types/dashboard.ts
export interface DashboardStats {
  totalQuotes: number;
  totalInvoices: number;
  totalProjects: number;
  totalClients: number;
  totalRevenue: number;
  conversionRate: number;
  pendingQuotes: number;
  overdueInvoices: number;
  activeProjects: number;
  totalPaidAmount: number;
  totalBalanceDue: number;
}

export interface ChartDataPoint {
  date: string;
  quotes: number;
  invoices: number;
  projects: number;
  revenue: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataPoint[];
}

export interface RecentClient {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  totalProjects: number;
  totalInvoices: number;
  totalQuotes: number;
  totalValue: number;
  lastActivity: string;
  status: string;
}

export interface QuoteOverview {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
  expired: number;
  draft: number;
  totalValue: number;
  acceptedValue: number;
  pendingValue: number;
}

export interface InvoiceOverview {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  draft: number;
  cancelled: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  overdueAmount: number;
}

export interface ProjectOverview {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  draft: number;
  totalHours: number;
  totalValue: number;
  activeValue: number;
  completedValue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  chart: ChartData;
  clients: RecentClient[];
  quotes: QuoteOverview;
  invoices: InvoiceOverview;
  projects: ProjectOverview;
}