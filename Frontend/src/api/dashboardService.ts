// src/api/dashboardService.ts
import api from '@/lib/axios';
import type {
  DashboardStats,
  ChartDataPoint,
  ChartData,
  RecentClient,
  QuoteOverview,
  InvoiceOverview,
  ProjectOverview,
  DashboardData
} from '@/types/dashboard';
import type { Quote, Invoice, Project, Client } from '@/types';

export const dashboardService = {
  // Get all dashboard data in one call
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const [stats, chart, clients, quotes, invoices, projects] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getChartData(),
        dashboardService.getRecentClients(),
        dashboardService.getQuotesOverview(),
        dashboardService.getInvoicesOverview(),
        dashboardService.getProjectsOverview()
      ]);

      return { stats, chart, clients, quotes, invoices, projects };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get dashboard statistics by aggregating real data
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      // Fetch all counts
      const [clientsCount, projectsCount, invoicesCount, quotesCount] = await Promise.all([
        api.get('/user/clients/count').then(res => res.data),
        api.get('/user/projects/count').then(res => res.data),
        api.get('/user/client/project/quote/invoices/count').then(res => res.data),
        api.get('/user/client/quotes/count').then(res => res.data)
      ]);

      // Fetch financial data
      const [totalPaidAmount, totalBalanceDue, acceptedQuotesTotal] = await Promise.all([
        api.get('/user/client/project/quote/invoices/total-paid').then(res => parseFloat(res.data) || 0),
        api.get('/user/client/project/quote/invoices/total-balance-due').then(res => parseFloat(res.data) || 0),
        api.get('/user/client/quotes/accepted-total').then(res => parseFloat(res.data) || 0)
      ]);

      // Get status-based counts
      const [pendingQuotes, overdueInvoices, activeProjects] = await Promise.all([
        api.get('/user/client/quotes/count/status/pending').then(res => res.data || 0),
        api.get('/user/client/project/quote/invoices/count/status/overdue').then(res => res.data || 0),
        api.get('/user/projects/count/status/active').then(res => res.data || 0)
      ]);

      // Calculate conversion rate
      const conversionRate = quotesCount > 0 
        ? Math.round(((acceptedQuotesTotal || 0) / quotesCount) * 100)
        : 0;

      return {
        totalQuotes: quotesCount || 0,
        totalInvoices: invoicesCount || 0,
        totalProjects: projectsCount || 0,
        totalClients: clientsCount || 0,
        totalRevenue: totalPaidAmount || 0,
        conversionRate,
        pendingQuotes: pendingQuotes || 0,
        overdueInvoices: overdueInvoices || 0,
        activeProjects: activeProjects || 0,
        totalPaidAmount,
        totalBalanceDue
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

    // Get chart data based on recent invoices and quotes
    getChartData: async (period: string = '30d'): Promise<ChartData> => {
    try {
        // Calculate date range
        const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '3m' ? 90 : period === '6m' ? 180 : 365;
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days);
        
        // Fetch ALL data
        const [quotesResponse, invoicesResponse, projectsResponse] = await Promise.all([
        api.get('/user/client/quotes'),
        api.get('/user/client/project/quote/invoices'),
        api.get('/user/projects')
        ]);

        const quotes = quotesResponse.data || [];
        const invoices = invoicesResponse.data || [];
        const projects = projectsResponse.data || [];

        // Filter data to only include items within the date range
        const filteredQuotes = quotes.filter((quote: any) => {
        if (!quote.createdAt) return false;
        const quoteDate = new Date(quote.createdAt);
        return quoteDate >= startDate;
        });

        const filteredInvoices = invoices.filter((invoice: any) => {
        if (!invoice.createdAt) return false;
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= startDate;
        });

        const filteredProjects = projects.filter((project: any) => {
        if (!project.createdAt) return false;
        const projectDate = new Date(project.createdAt);
        return projectDate >= startDate;
        });

        // Group data by date
        const quotesByDate: { [date: string]: number } = {};
        const invoicesByDate: { [date: string]: number } = {};
        const projectsByDate: { [date: string]: number } = {};
        const revenueByDate: { [date: string]: number } = {};

        // Initialize all dates in the range to 0
        const labels: string[] = [];
        for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Create label
        let dateStr: string;
        if (period === '1y') {
            // For yearly view, show months
            dateStr = date.toLocaleDateString('en-US', { month: 'short' });
        } else if (period === '3m' || period === '6m') {
            // For 3-6 months, show month and day
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            // For 7-30 days, show month and day
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        // For yearly view, group by month
        const key = period === '1y' 
            ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : dateKey;
        
        labels.push(dateStr);
        quotesByDate[key] = 0;
        invoicesByDate[key] = 0;
        projectsByDate[key] = 0;
        revenueByDate[key] = 0;
        }

        // Count quotes by date
        filteredQuotes.forEach((quote: any) => {
        const quoteDate = new Date(quote.createdAt);
        let key: string;
        
        if (period === '1y') {
            key = quoteDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else {
            key = quoteDate.toISOString().split('T')[0];
        }
        
        if (quotesByDate[key] !== undefined) {
            quotesByDate[key]++;
        }
        });

        // Count invoices and calculate revenue by date
        filteredInvoices.forEach((invoice: any) => {
        const invoiceDate = new Date(invoice.createdAt);
        let key: string;
        
        if (period === '1y') {
            key = invoiceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else {
            key = invoiceDate.toISOString().split('T')[0];
        }
        
        if (invoicesByDate[key] !== undefined) {
            invoicesByDate[key]++;
            
            // Add revenue for PAID invoices
            if (invoice.status === 'paid' && invoice.totalAmount) {
            revenueByDate[key] += invoice.totalAmount;
            }
        }
        });

        // Count projects by date
        filteredProjects.forEach((project: any) => {
        const projectDate = new Date(project.createdAt);
        let key: string;
        
        if (period === '1y') {
            key = projectDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else {
            key = projectDate.toISOString().split('T')[0];
        }
        
        if (projectsByDate[key] !== undefined) {
            projectsByDate[key]++;
        }
        });

        // Build the final dataset
        const datasets: ChartDataPoint[] = labels.map((label, index) => {
        // Get the corresponding date key
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - index));
        
        let key: string;
        if (period === '1y') {
            key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else {
            key = date.toISOString().split('T')[0];
        }

        console.log({
            date: label,
            quotes: quotesByDate[key] || 0,
            invoices: invoicesByDate[key] || 0,
            projects: projectsByDate[key] || 0,
            revenue: revenueByDate[key] || 0
        });
        
        
        return {
            date: label,
            quotes: quotesByDate[key] || 0,
            invoices: invoicesByDate[key] || 0,
            projects: projectsByDate[key] || 0,
            revenue: revenueByDate[key] || 0
        };
        });

        return { labels, datasets };
        
    } catch (error) {
        console.error('Error generating chart data:', error);
        
        // Fallback with sample data
        const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '3m' ? 90 : period === '6m' ? 180 : 365;
        const labels: string[] = [];
        const datasets: ChartDataPoint[] = [];
        
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        let dateStr: string;
        if (period === '1y') {
            dateStr = date.toLocaleDateString('en-US', { month: 'short' });
        } else if (period === '3m' || period === '6m') {
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        labels.push(dateStr);
        
        datasets.push({
            date: dateStr,
            quotes: Math.floor(Math.random() * 3) + 1,
            invoices: Math.floor(Math.random() * 2) + 1,
            projects: Math.floor(Math.random() * 1) + 1,
            revenue: Math.floor(Math.random() * 1000) + 500
        });
        }
        
        return { labels, datasets };
    }
    },

  // Get recent clients with their stats
  getRecentClients: async (limit: number = 5): Promise<RecentClient[]> => {
    try {
      const response = await api.get('/user/clients/recent', {
        params: { limit }
      });
      
      const clients = response.data || [];
      
      // For each client, fetch their projects, invoices, and quotes
      const clientsWithStats = await Promise.all(
        clients.map(async (client: any) => {
          try {
            const [projects, invoices, quotes] = await Promise.all([
              api.get(`/user/projects/client/${client.id}`).then(res => res.data || []).catch(() => []),
              api.get(`/user/client/project/quote/invoices/client/${client.id}`).then(res => res.data || []).catch(() => []),
              api.get(`/user/client/quotes/client/${client.id}`).then(res => res.data || []).catch(() => [])
            ]);

            // Calculate total value from invoices
            const totalValue = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
            
            return {
              id: client.id,
              name: client.contactName || client.name || client.company || 'Unnamed Client',
              email: client.email || 'No email',
              company: client.company || 'Individual',
              phone: client.phone,
              totalProjects: projects.length || 0,
              totalInvoices: invoices.length || 0,
              totalQuotes: quotes.length || 0,
              totalValue,
              lastActivity: client.updatedAt || client.createdAt || new Date().toISOString(),
              status: client.status || 'active'
            };
          } catch (error) {
            console.error(`Error fetching stats for client ${client.id}:`, error);
            return {
              id: client.id,
              name: client.contactName || client.name || client.company || 'Unnamed Client',
              email: client.email || 'No email',
              company: client.company || 'Individual',
              phone: client.phone,
              totalProjects: 0,
              totalInvoices: 0,
              totalQuotes: 0,
              totalValue: 0,
              lastActivity: client.updatedAt || client.createdAt || new Date().toISOString(),
              status: client.status || 'active'
            };
          }
        })
      );

      return clientsWithStats;
    } catch (error) {
      console.error('Error fetching recent clients:', error);
      throw error;
    }
  },

  // Get quotes overview with detailed stats
  getQuotesOverview: async (): Promise<QuoteOverview> => {
    try {
      // Get all quotes
      const response = await api.get('/user/client/quotes');
      const quotes = response.data || [];

      // Calculate overview
      const total = quotes.length;
      const accepted = quotes.filter((q: any) => q.status === 'accepted').length;
      const pending = quotes.filter((q: any) => q.status === 'pending').length;
      const rejected = quotes.filter((q: any) => q.status === 'rejected').length;
      const expired = quotes.filter((q: any) => q.status === 'expired').length;
      const draft = quotes.filter((q: any) => q.status === 'draft').length;

      // Calculate values
      const totalValue = quotes.reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0);
      const acceptedValue = quotes
        .filter((q: any) => q.status === 'accepted')
        .reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0);
      const pendingValue = quotes
        .filter((q: any) => q.status === 'pending')
        .reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0);

      return {
        total,
        accepted,
        pending,
        rejected,
        expired,
        draft,
        totalValue,
        acceptedValue,
        pendingValue
      };
    } catch (error) {
      console.error('Error fetching quotes overview:', error);
      throw error;
    }
  },

  // Get invoices overview with detailed stats
  getInvoicesOverview: async (): Promise<InvoiceOverview> => {
    try {
      // Get all invoices
      const response = await api.get('/user/client/project/quote/invoices');
      const invoices = response.data || [];

      // Calculate overview
      const total = invoices.length;
      const paid = invoices.filter((inv: any) => inv.status === 'paid').length;
      const pending = invoices.filter((inv: any) => inv.status === 'pending').length;
      const overdue = invoices.filter((inv: any) => inv.status === 'overdue').length;
      const draft = invoices.filter((inv: any) => inv.status === 'draft').length;
      const cancelled = invoices.filter((inv: any) => inv.status === 'cancelled').length;

      // Calculate amounts
      const totalAmount = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
      const totalPaid = invoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
      const totalDue = invoices
        .filter((inv: any) => ['pending', 'overdue'].includes(inv.status))
        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
      const overdueAmount = invoices
        .filter((inv: any) => inv.status === 'overdue')
        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

      return {
        total,
        paid,
        pending,
        overdue,
        draft,
        cancelled,
        totalAmount,
        totalPaid,
        totalDue,
        overdueAmount
      };
    } catch (error) {
      console.error('Error fetching invoices overview:', error);
      throw error;
    }
  },

  // Get projects overview with detailed stats
  getProjectsOverview: async (): Promise<ProjectOverview> => {
    try {
      // Get all projects
      const response = await api.get('/user/projects');
      const projects = response.data || [];

      // Calculate overview
      const total = projects.length;
      const active = projects.filter((p: any) => p.status === 'active').length;
      const completed = projects.filter((p: any) => p.status === 'completed').length;
      const onHold = projects.filter((p: any) => p.status === 'on_hold').length;
      const cancelled = projects.filter((p: any) => p.status === 'cancelled').length;
      const draft = projects.filter((p: any) => p.status === 'draft').length;

      // Calculate values
      const totalHours = projects.reduce((sum: number, p: any) => sum + (p.totalHours || 0), 0);
      const totalValue = projects.reduce((sum: number, p: any) => {
        const value = p.fixedPrice || (p.hourlyRate || 0) * (p.totalHours || 0);
        return sum + value;
      }, 0);
      const activeValue = projects
        .filter((p: any) => p.status === 'active')
        .reduce((sum: number, p: any) => {
          const value = p.fixedPrice || (p.hourlyRate || 0) * (p.totalHours || 0);
          return sum + value;
        }, 0);
      const completedValue = projects
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => {
          const value = p.fixedPrice || (p.hourlyRate || 0) * (p.totalHours || 0);
          return sum + value;
        }, 0);

      return {
        total,
        active,
        completed,
        onHold,
        cancelled,
        draft,
        totalHours,
        totalValue,
        activeValue,
        completedValue
      };
    } catch (error) {
      console.error('Error fetching projects overview:', error);
      throw error;
    }
  }
};