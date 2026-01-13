import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteService } from '@/api/quoteService';
import type {
  Quote,
  QuoteItem,
  QuoteSummary,
  QuoteHistory,
  CreateQuoteRequest,
  QuoteStats,
  UpdateQuoteRequest,
  CreateQuoteItemRequest,
  UpdateQuoteItemRequest
} from '@/types/quote';
import { toast } from 'sonner';

export const useQuotes = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ['quotes', 'paginated', page, size],
    queryFn: () => quoteService.getQuotesPaginated(page, size),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllQuotes = () => {
  return useQuery({
    queryKey: ['quotes', 'all'],
    queryFn: () => quoteService.getAllQuotes(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuote = (quoteId?: string) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quoteId ? quoteService.getQuoteById(quoteId) : null,
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuoteSummary = (quoteId?: string) => {
  return useQuery({
    queryKey: ['quote-summary', quoteId],
    queryFn: () => quoteId ? quoteService.getQuoteSummary(quoteId) : null,
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuoteHistory = (quoteId?: string) => {
  return useQuery({
    queryKey: ['quote-history', quoteId],
    queryFn: () => quoteId ? quoteService.getQuoteHistory(quoteId) : [],
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quoteService.createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
      toast.success('Quote created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create quote');
    },
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data: UpdateQuoteRequest }) =>
      quoteService.updateQuote(quoteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quote-summary', variables.quoteId] });
      toast.success('Quote updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update quote');
    },
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quoteService.deleteQuote,
    onSuccess: (_, quoteId) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
      toast.success('Quote deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete quote');
    },
  });
};

export const useSendQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quoteService.sendQuote,
    onSuccess: (updatedQuote) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', updatedQuote.id] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
      toast.success('Quote sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send quote');
    },
  });
};

export const useDuplicateQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: quoteService.duplicateQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
      toast.success('Quote duplicated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate quote');
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, status }: { quoteId: string; status: string }) =>
      quoteService.updateQuoteStatus(quoteId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
      toast.success('Quote status updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update quote status');
    },
  });
};

export const useQuotesByStatus = (status: string) => {
  return useQuery({
    queryKey: ['quotes', 'status', status],
    queryFn: () => quoteService.getQuotesByStatus(status),
    enabled: !!status,
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuotesByClient = (clientId?: string) => {
  return useQuery({
    queryKey: ['quotes', 'client', clientId],
    queryFn: () => clientId ? quoteService.getQuotesByClient(clientId) : [],
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuotesByProject = (projectId?: string) => {
  return useQuery({
    queryKey: ['quotes', 'project', projectId],
    queryFn: () => projectId ? quoteService.getQuotesByProject(projectId) : [],
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchQuotes = (query: string) => {
  return useQuery({
    queryKey: ['quotes', 'search', query],
    queryFn: () => quoteService.searchQuotes(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5,
  });
};

export const useExportQuotes = () => {
  return useMutation({
    mutationFn: quoteService.exportQuotesToCSV,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Quotes exported successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to export quotes');
    },
  });
};

export const useExportQuotePDF = () => {
  return useMutation({
    mutationFn: quoteService.exportQuoteToPDF,
    onSuccess: (data, quoteId) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quote_${quoteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Quote PDF downloaded!');
    },
    onError: (error: any) => {
      toast.error('Failed to generate PDF');
    },
  });
};

export const useGenerateQuotePreview = () => {
  return useMutation({
    mutationFn: quoteService.generateQuotePreview,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      window.open(url, '_blank');
    },
    onError: (error: any) => {
      toast.error('Failed to generate preview');
    },
  });
};

export const useGenerateQuoteNumber = () => {
  return useQuery({
    queryKey: ['quote-number'],
    queryFn: () => quoteService.generateQuoteNumber(),
    staleTime: 1000 * 60,
  });
};

export const useRecentQuotes = (limit: number = 5) => {
  return useQuery({
    queryKey: ['quotes', 'recent', limit],
    queryFn: () => quoteService.getRecentQuotes(limit),
    staleTime: 1000 * 60 * 5,
  });
};

// stats
export const useQuoteStats = () => {
  return useQuery({
    queryKey: ['quote-stats'],
    queryFn: async (): Promise<QuoteStats> => {
      try {
        // Fetch all stats from separate endpoints
        const [
          totalQuotesRes,
          draftCountRes,
          sentCountRes,
          acceptedCountRes,
          rejectedCountRes,
          expiredCountRes,
          acceptedTotalAmountRes
        ] = await Promise.all([
          quoteService.getQuotesCount(),
          quoteService.getQuotesCountByStatus('draft'),
          quoteService.getQuotesCountByStatus('sent'),
          quoteService.getQuotesCountByStatus('accepted'),
          quoteService.getQuotesCountByStatus('rejected'),
          quoteService.getQuotesCountByStatus('expired'),
          quoteService.getAcceptedQuotesTotal()
        ]);

        // Parse responses - backend returns Long/String
        const totalQuotes = Number(totalQuotesRes) || 0;
        const draftQuotes = Number(draftCountRes) || 0;
        const sentQuotes = Number(sentCountRes) || 0;
        const acceptedQuotes = Number(acceptedCountRes) || 0;
        const rejectedQuotes = Number(rejectedCountRes) || 0;
        const expiredQuotes = Number(expiredCountRes) || 0;
        const acceptedTotalAmount = parseFloat(acceptedTotalAmountRes?.toString() || '0') || 0;

        // For average and acceptance rate, we need all quotes
        const allQuotes = await quoteService.getAllQuotes();
        
        // Calculate total amount from all quotes
        const totalAmountAll = allQuotes.reduce((sum, quote) => {
          return sum + (quote.totalAmount || 0);
        }, 0);

        const averageQuoteValue = totalQuotes > 0 ? totalAmountAll / totalQuotes : 0;
        const acceptanceRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0;

        return {
          totalQuotes,
          draftQuotes,
          sentQuotes,
          acceptedQuotes,
          rejectedQuotes,
          expiredQuotes,
          acceptedTotalAmount,
          averageQuoteValue,
          acceptanceRate
        };
      } catch (error) {
        console.error('Error fetching quote stats:', error);
        return {
          totalQuotes: 0,
          draftQuotes: 0,
          sentQuotes: 0,
          acceptedQuotes: 0,
          rejectedQuotes: 0,
          expiredQuotes: 0,
          acceptedTotalAmount: 0,
          averageQuoteValue: 0,
          acceptanceRate: 0
        };
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};

// ========== QUOTE ITEMS HOOKS ==========

export const useQuoteItems = (quoteId?: string) => {
  return useQuery({
    queryKey: ['quote-items', quoteId],
    queryFn: () => quoteId ? quoteService.getQuoteItems(quoteId) : [],
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddQuoteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data: CreateQuoteItemRequest }) =>
      quoteService.addQuoteItem(quoteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
      toast.success('Item added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add item');
    },
  });
};

export const useUpdateQuoteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, itemId, data }: { 
      quoteId: string; 
      itemId: string; 
      data: UpdateQuoteItemRequest 
    }) => quoteService.updateQuoteItem(quoteId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
      toast.success('Item updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });
};

export const useDeleteQuoteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, itemId }: { quoteId: string; itemId: string }) =>
      quoteService.deleteQuoteItem(quoteId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });
};

export const useReorderQuoteItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, itemIds }: { quoteId: string; itemIds: string[] }) =>
      quoteService.reorderQuoteItems(quoteId, itemIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ['quote', variables.quoteId] });
      toast.success('Items reordered!');
    },
    onError: (error: any) => {
      toast.error('Failed to reorder items');
    },
  });
};