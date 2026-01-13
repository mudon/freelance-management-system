export type ClientCategory = null | 'recurring' | 'one-time' | 'prospect' | 'high-value' | 'low-value';

export interface Client {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxNumber?: string;
  notes?: string;
  status: 'active' | 'archived';
  clientCategory?: ClientCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSummary {
  companyName: string;
  contactName: string;
  status: string;
  revenueTier: 'low' | 'medium' | 'high';
  projectCount: number;
  activeProjectCount: number;
  totalPaidAmount: number;
  outstandingBalance: number;
  onTimePaymentRate: number;
  paymentBehavior: 'excellent' | 'good' | 'average' | 'poor';
  hasOverdueInvoices: boolean;
  hasPendingQuotes: boolean;
  lastPaymentDate: string;
  engagementLevel: 'low' | 'medium' | 'high';
}

export interface CreateClientRequest {
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  clientCategory?: ClientCategory;
  notes?: string;
}

export interface UpdateClientRequest {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxNumber?: string;
  notes?: string;
  status?: 'active' | 'archived';
  clientCategory?: ClientCategory;
}

export interface ClientsResponse {
  content: Client[];
  totalElements: number;
  totalPages: number;
  number: number;     // current page (0-based)
  size: number;       // page size
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  archivedClients: number;
  recurringClients: number;
  highValueClients: number;
  totalRevenue: number;
  avgProjectsPerClient: number;
}