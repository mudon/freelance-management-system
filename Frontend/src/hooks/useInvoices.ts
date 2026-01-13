import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/api/invoiceService';
import type {
  InvoiceStats,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateInvoiceItemRequest,
  UpdateInvoiceItemRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest
} from '@/types/invoice';
import { toast } from 'sonner';

export const useInvoices = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ['invoices', 'paginated', page, size],
    queryFn: () => invoiceService.getInvoicesPaginated(page, size),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'all'],
    queryFn: () => invoiceService.getAllInvoices(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvoice = (invoiceId?: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceId ? invoiceService.getInvoiceById(invoiceId) : null,
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvoiceSummary = (invoiceId?: string) => {
  return useQuery({
    queryKey: ['invoice-summary', invoiceId],
    queryFn: () => invoiceId ? invoiceService.getInvoiceSummary(invoiceId) : null,
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvoiceAgingReport = () => {
  return useQuery({
    queryKey: ['invoice-aging-report'],
    queryFn: () => invoiceService.getInvoiceAgingReport(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateInvoice = () => { //will be removed
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });
};

export const useCreateInvoiceFromQuote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data?: CreateInvoiceRequest }) => 
      invoiceService.createInvoiceFromQuote(quoteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice created from quote successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice from quote');
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: UpdateInvoiceRequest }) =>
      invoiceService.updateInvoice(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-summary', variables.invoiceId] });
      toast.success('Invoice updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invoiceService.deleteInvoice,
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });
};

export const useSendInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invoiceService.sendInvoice,
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', updatedInvoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invoice');
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invoiceService.cancelInvoice,
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', updatedInvoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice cancelled successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel invoice');
    },
  });
};

export const useDuplicateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invoiceService.duplicateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice duplicated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate invoice');
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: string; status: string }) =>
      invoiceService.updateInvoiceStatus(invoiceId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice status updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update invoice status');
    },
  });
};

export const useInvoicesByStatus = (status: string) => {
  return useQuery({
    queryKey: ['invoices', 'status', status],
    queryFn: () => invoiceService.getInvoicesByStatus(status),
    enabled: !!status,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvoicesByClient = (clientId?: string) => {
  return useQuery({
    queryKey: ['invoices', 'client', clientId],
    queryFn: () => clientId ? invoiceService.getInvoicesByClient(clientId) : [],
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvoicesByProject = (projectId?: string) => {
  return useQuery({
    queryKey: ['invoices', 'project', projectId],
    queryFn: () => projectId ? invoiceService.getInvoicesByProject(projectId) : [],
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInvoicesByQuote = (quoteId?: string) => {
  return useQuery({
    queryKey: ['invoices', 'quote', quoteId],
    queryFn: () => quoteId ? invoiceService.getInvoicesByQuote(quoteId) : [],
    enabled: !!quoteId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchInvoices = (query: string) => {
  return useQuery({
    queryKey: ['invoices', 'search', query],
    queryFn: () => invoiceService.searchInvoices(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5,
  });
};

export const useExportInvoices = () => {
  return useMutation({
    mutationFn: invoiceService.exportInvoicesToCSV,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoices exported successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to export invoices');
    },
  });
};

export const useExportInvoicePDF = () => {
  return useMutation({
    mutationFn: invoiceService.exportInvoiceToPDF,
    onSuccess: (data, invoiceId) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice PDF downloaded!');
    },
    onError: (error: any) => {
      toast.error('Failed to generate PDF');
    },
  });
};

export const useGeneratePaymentLink = () => {
  return useMutation({
    mutationFn: invoiceService.generatePaymentLink,
    onSuccess: (paymentLink) => {
      navigator.clipboard.writeText(paymentLink);
      toast.success('Payment link copied to clipboard!');
    },
    onError: (error: any) => {
      toast.error('Failed to generate payment link');
    },
  });
};

export const useGenerateInvoiceNumber = () => {
  return useQuery({
    queryKey: ['invoice-number'],
    queryFn: () => invoiceService.generateInvoiceNumber(),
    staleTime: 1000 * 60,
  });
};

export const useRecentInvoices = (limit: number = 5) => {
  return useQuery({
    queryKey: ['invoices', 'recent', limit],
    queryFn: () => invoiceService.getRecentInvoices(limit),
    staleTime: 1000 * 60 * 5,
  });
};

// Stats
// Update your useInvoiceStats to return InvoiceStats type:
export const useInvoiceStats = () => {
  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async (): Promise<InvoiceStats> => {
      // Fetch all stats from separate endpoints
      const [
        totalInvoicedRes,
        totalPaidRes,
        totalBalanceDueRes,
        invoicesCountRes,
        draftCountRes,
        sentCountRes,
        partialCountRes,
        paidCountRes,
        overdueInvoicesRes
      ] = await Promise.all([
        invoiceService.getTotalInvoicedAmount(),
        invoiceService.getTotalAmountPaid(),
        invoiceService.getTotalBalanceDue(),
        invoiceService.getInvoicesCount(),
        invoiceService.getInvoicesCountByStatus('draft'),
        invoiceService.getInvoicesCountByStatus('sent'),
        invoiceService.getInvoicesCountByStatus('partial'),
        invoiceService.getInvoicesCountByStatus('paid'),
        invoiceService.getOverdueInvoices()
      ]);

      // Parse responses
      const totalInvoiced = Number(totalInvoicedRes) || 0;
      const totalPaid = Number(totalPaidRes) || 0;
      const totalBalanceDue = Number(totalBalanceDueRes) || 0;
      const totalInvoices = Number(invoicesCountRes) || 0;
      const draftInvoices = Number(draftCountRes) || 0;
      const sentInvoices = Number(sentCountRes) || 0;
      const partialInvoices = Number(partialCountRes) || 0;
      const paidInvoices = Number(paidCountRes) || 0;
      const overdueInvoices = Array.isArray(overdueInvoicesRes) ? overdueInvoicesRes.length : 0;

      // Calculate overdue amount
      const overdueAmount = Array.isArray(overdueInvoicesRes) 
        ? overdueInvoicesRes.reduce((sum, invoice) => sum + (invoice.balanceDue || 0), 0)
        : 0;

      // Calculate averages
      const averageInvoiceValue = totalInvoices > 0 ? totalInvoiced / totalInvoices : 0;
      const onTimePaymentRate = totalInvoiced > 0 
        ? (totalPaid / totalInvoiced) * 100 
        : 0;

      return {
        totalInvoices,
        draftInvoices,
        sentInvoices,
        partialInvoices,
        paidInvoices,
        overdueInvoices,
        totalInvoicedAmount: totalInvoiced,
        totalAmountPaid: totalPaid,
        totalBalanceDue,
        averageInvoiceValue,
        onTimePaymentRate,
        overdueAmount
      };
    },
    staleTime: 1000 * 60 * 10,
  });
};

// ========== INVOICE ITEMS HOOKS ==========

export const useInvoiceItems = (invoiceId?: string) => {
  return useQuery({
    queryKey: ['invoice-items', invoiceId],
    queryFn: () => invoiceId ? invoiceService.getInvoiceItems(invoiceId) : [],
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddInvoiceItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: CreateInvoiceItemRequest }) =>
      invoiceService.addInvoiceItem(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      toast.success('Item added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add item');
    },
  });
};

export const useUpdateInvoiceItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, itemId, data }: { 
      invoiceId: string; 
      itemId: string; 
      data: UpdateInvoiceItemRequest 
    }) => invoiceService.updateInvoiceItem(invoiceId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      toast.success('Item updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });
};

export const useDeleteInvoiceItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, itemId }: { invoiceId: string; itemId: string }) =>
      invoiceService.deleteInvoiceItem(invoiceId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });
};

export const useReorderInvoiceItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, itemIds }: { invoiceId: string; itemIds: string[] }) =>
      invoiceService.reorderInvoiceItems(invoiceId, itemIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-items', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      toast.success('Items reordered!');
    },
    onError: (error: any) => {
      toast.error('Failed to reorder items');
    },
  });
};

// ========== PAYMENT HOOKS ==========

export const useInvoicePayments = (invoiceId?: string) => {
  return useQuery({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: () => invoiceId ? invoiceService.getInvoicePayments(invoiceId) : [],
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: CreatePaymentRequest }) =>
      invoiceService.addPayment(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Payment recorded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, paymentId, data }: { 
      invoiceId: string; 
      paymentId: string; 
      data: UpdatePaymentRequest 
    }) => invoiceService.updatePayment(invoiceId, paymentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Payment updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment');
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, paymentId }: { invoiceId: string; paymentId: string }) =>
      invoiceService.deletePayment(invoiceId, paymentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Payment deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete payment');
    },
  });
};