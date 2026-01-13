import type { DashboardStats, Client, Project, Invoice, Quote } from '../types';

export const mockAPI = {
  dashboard: async (): Promise<DashboardStats> => ({
    revenue: { current: 45230, previous: 38950, change: 16.1 },
    invoices: { total: 23, paid: 18, pending: 5 },
    projects: { active: 8, completed: 34 },
    clients: { total: 15, active: 12 }
  }),
  
  clients: async (): Promise<Client[]> => ([
    { id: '1', company_name: 'Tech Corp', contact_name: 'John Doe', email: 'john@techcorp.com', status: 'active', projects: 3, avatar_color: 'bg-gradient-to-br from-blue-500 to-cyan-400' },
    { id: '2', company_name: 'Design Studio', contact_name: 'Jane Smith', email: 'jane@design.com', status: 'active', projects: 2, avatar_color: 'bg-gradient-to-br from-purple-500 to-pink-400' },
    { id: '3', company_name: 'Startup Inc', contact_name: 'Bob Johnson', email: 'bob@startup.com', status: 'active', projects: 1, avatar_color: 'bg-gradient-to-br from-amber-500 to-orange-400' },
    { id: '4', company_name: 'Global Enterprises', contact_name: 'Alice Brown', email: 'alice@global.com', status: 'archived', projects: 0, avatar_color: 'bg-gradient-to-br from-gray-500 to-gray-400' },
    { id: '5', company_name: 'Creative Labs', contact_name: 'Mike Wilson', email: 'mike@creativelabs.com', status: 'active', projects: 4, avatar_color: 'bg-gradient-to-br from-emerald-500 to-teal-400' },
    { id: '6', company_name: 'Digital Solutions', contact_name: 'Sarah Davis', email: 'sarah@digital.com', status: 'active', projects: 2, avatar_color: 'bg-gradient-to-br from-rose-500 to-pink-400' },
  ]),
  
  projects: async (): Promise<Project[]> => ([
    { id: '1', name: 'Website Redesign', client: 'Tech Corp', status: 'active', budget: 15000, progress: 65, deadline: '2024-03-15' },
    { id: '2', name: 'Mobile App Development', client: 'Design Studio', status: 'active', budget: 25000, progress: 40, deadline: '2024-04-30' },
    { id: '3', name: 'Brand Identity', client: 'Startup Inc', status: 'completed', budget: 8000, progress: 100, deadline: '2024-01-10' },
    { id: '4', name: 'E-commerce Platform', client: 'Global Enterprises', status: 'on_hold', budget: 35000, progress: 25, deadline: '2024-05-20' },
    { id: '5', name: 'Marketing Campaign', client: 'Creative Labs', status: 'active', budget: 12000, progress: 80, deadline: '2024-02-28' },
    { id: '6', name: 'Data Analytics Dashboard', client: 'Digital Solutions', status: 'active', budget: 18000, progress: 55, deadline: '2024-03-30' },
  ]),
  
  invoices: async (): Promise<Invoice[]> => ([
    { id: '1', invoice_number: 'INV-001', client: 'Tech Corp', total_amount: 5000, status: 'paid', due_date: '2024-01-15', paid_date: '2024-01-10' },
    { id: '2', invoice_number: 'INV-002', client: 'Design Studio', total_amount: 7500, status: 'sent', due_date: '2024-02-01', paid_date: null },
    { id: '3', invoice_number: 'INV-003', client: 'Startup Inc', total_amount: 3200, status: 'overdue', due_date: '2024-01-20', paid_date: null },
    { id: '4', invoice_number: 'INV-004', client: 'Global Enterprises', total_amount: 12500, status: 'partial', due_date: '2024-02-15', paid_date: null },
    { id: '5', invoice_number: 'INV-005', client: 'Creative Labs', total_amount: 8400, status: 'paid', due_date: '2024-01-25', paid_date: '2024-01-20' },
    { id: '6', invoice_number: 'INV-006', client: 'Digital Solutions', total_amount: 9500, status: 'viewed', due_date: '2024-02-10', paid_date: null },
  ]),
  
  quotes: async (): Promise<Quote[]> => ([
    { id: '1', quote_number: 'QTE-001', client: 'Tech Corp', title: 'Q1 Development Package', total_amount: 12000, status: 'accepted', valid_until: '2024-02-28' },
    { id: '2', quote_number: 'QTE-002', client: 'New Client', title: 'Marketing Campaign', total_amount: 8500, status: 'sent', valid_until: '2024-02-15' },
    { id: '3', quote_number: 'QTE-003', client: 'Startup Inc', title: 'UI/UX Redesign', total_amount: 6500, status: 'draft', valid_until: '2024-03-10' },
    { id: '4', quote_number: 'QTE-004', client: 'Global Enterprises', title: 'Enterprise Solution', total_amount: 25000, status: 'sent', valid_until: '2024-03-05' },
    { id: '5', quote_number: 'QTE-005', client: 'Creative Labs', title: 'Brand Strategy', total_amount: 7500, status: 'accepted', valid_until: '2024-02-20' },
  ])
};