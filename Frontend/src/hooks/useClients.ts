import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '@/api/clientService';
import type { 
  UpdateClientRequest,
} from '@/types/client';
import { toast } from 'sonner';

export const useClients = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ['clients', 'paginated', page, size],
    queryFn: () => clientService.getClientsPaginated(page, size),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useClient = (clientId?: string) => {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientId ? clientService.getClientById(clientId) : null,
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useClientSummary = (clientId?: string) => {
  return useQuery({
    queryKey: ['client-summary', clientId],
    queryFn: () => clientId ? clientService.getClientSummary(clientId) : null,
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useClientStats = () => {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: () => clientService.getClientStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.createClient,
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      toast.success('Client created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create client');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: UpdateClientRequest }) =>
      clientService.updateClient(clientId, data),
    onSuccess: (updatedClient, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-summary', variables.clientId] });
      toast.success('Client updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update client');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: (_, clientId) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      toast.success('Client deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    },
  });
};

export const useArchiveClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.archiveClient,
    onSuccess: (updatedClient, clientId) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      toast.success('Client archived successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive client');
    },
  });
};

export const useRestoreClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.restoreClient,
    onSuccess: (updatedClient, clientId) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      toast.success('Client restored successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore client');
    },
  });
};

export const useSearchClients = (query: string) => {
  return useQuery({
    queryKey: ['clients', 'search', query],
    queryFn: () => clientService.searchClients(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5,
  });
};

export const useExportClients = () => {
  return useMutation({
    mutationFn: clientService.exportClientsToCSV,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Clients exported successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to export clients');
    },
  });
};

export const useImportClients = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.importClientsFromCSV,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      toast.success(`Successfully imported ${result.success} clients (${result.failed} failed)`);
    },
    onError: (error: any) => {
      toast.error('Failed to import clients');
    },
  });
};