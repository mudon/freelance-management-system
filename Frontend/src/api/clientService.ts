import api from '@/lib/axios';
import type { 
  Client, 
  ClientSummary, 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientsResponse,
  ClientStats 
} from '@/types/client';

export const clientService = {
  // Create a new client
  createClient: async (data: CreateClientRequest): Promise<Client> => {
    const { data: res } = await api.post('/user/clients', data);
    return res;
  },

  // Get all clients
  getAllClients: async (): Promise<Client[]> => {
    const { data } =await api.get('/user/clients');
    return data;
  },

  // Get clients with pagination
  getClientsPaginated: async (
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDir = 'desc'
  ): Promise<ClientsResponse> => {
    const { data } = await api.get<ClientsResponse>(
      '/user/clients/paginated',
      {
        params: { page, size, sortBy, sortDir },
      }
    );
    return data;
  },

  // Get client by ID
  getClientById: async (clientId: string): Promise<Client> => {
    const { data } = await api.get(`/user/clients/${clientId}`);
    return data;
  },

  // Update client
  updateClient: async (clientId: string, payload: UpdateClientRequest): Promise<Client> => {
     const { data } = await api.put(`/user/clients/${clientId}`, payload);
    return data;
  },

  // Delete client
  deleteClient: async (clientId: string): Promise<void> => {
    await api.delete(`/user/clients/${clientId}`);
  },

  // Archive client
  archiveClient: async (clientId: string): Promise<Client> => {
     const { data } = await api.post(`/user/clients/${clientId}/archive`);
    return data;
  },

  // Restore client
  restoreClient: async (clientId: string): Promise<Client> => {
     const { data } = await api.post(`/user/clients/${clientId}/restore`);
    return data;
  },

  // Get clients by status
  getClientsByStatus: async (status: string): Promise<Client[]> => {
     const { data } = await api.get(`/user/clients/status/${status}`);
    return data;
  },

  // Search clients
  searchClients: async (query: string): Promise<Client[]> => {
    const { data } = await api.get<Client[]>(
      '/user/clients/search',
      {
        params: { query },
      }
    );
    return data;
  },

  // Get client summary
  getClientSummary: async (clientId: string): Promise<ClientSummary> => {
    const { data } = await api.get(`/user/clients/${clientId}/summary`);
    return data;
  },

  // Get clients count
  getClientsCount: async (): Promise<{ count: number }> => {
    const { data } = await api.get<{ count: number }>(
      '/user/clients/count'
    );
    return data;
  },

  // Get recent clients
  getRecentClients: async (limit = 5): Promise<Client[]> => {
    const { data } = await api.get<Client[]>(
      '/user/clients/recent',
      {
        params: { limit },
      }
    );
    return data;
  },

  // Get client statistics
  getClientStats: async (): Promise<ClientStats> => {
    // This endpoint might not exist, you can implement it on backend or calculate on frontend
    const [clients, summary] = await Promise.all([
      clientService.getAllClients(),
      clientService.getClientsCount()
    ]);

    const stats: ClientStats = {
      totalClients: summary.count,
      activeClients: clients.filter(c => c.status === 'active').length,
      archivedClients: clients.filter(c => c.status === 'archived').length,
      recurringClients: clients.filter(c => c.clientCategory === 'recurring').length,
      highValueClients: clients.filter(c => c.clientCategory === 'high-value').length,
      totalRevenue: 0, // This would need backend support
      avgProjectsPerClient: 0 // This would need backend support
    };

    return stats;
  },

  // Export clients to CSV
  exportClientsToCSV: async (): Promise<Blob> => {
    const { data } = await api.get<Blob>(
      '/user/clients/export',
      { responseType: 'blob' }
    );
    return data;
  },

  // Bulk import clients
  importClientsFromCSV: async (
    file: File
  ): Promise<{ success: number; failed: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ success: number; failed: number }>(
      '/user/clients/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },
};

export default clientService;