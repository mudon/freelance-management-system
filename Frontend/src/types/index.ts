export interface DashboardStats {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  invoices: {
    total: number;
    paid: number;
    pending: number;
  };
  projects: {
    active: number;
    completed: number;
  };
  clients: {
    total: number;
    active: number;
  };
}

export interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  status: 'active' | 'archived';
  projects: number;
  avatar_color: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  budget: number;
  progress: number;
  deadline: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date: string | null;
}

export interface Quote {
  id: string;
  quote_number: string;
  client: string;
  title: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
}

export type StatusType = Client['status'] | Project['status'] | Invoice['status'] | Quote['status'];

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}