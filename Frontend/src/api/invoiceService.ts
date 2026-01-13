import api from '@/lib/axios';
import type {
  Invoice,
  InvoiceItem,
  InvoicePayment,
  InvoiceSummary,
  InvoiceAgingReport,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateInvoiceItemRequest,
  UpdateInvoiceItemRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  InvoicesResponse
} from '@/types/invoice';

export const invoiceService = {
  // Get all invoices with pagination
  getInvoicesPaginated: async (page: number = 0, size: number = 20): Promise<InvoicesResponse> => {
    const response = await api.get(`/user/client/project/quote/invoices/paginated`, {
      params: { page, size }
    });

    return response.data;
  },

  // Get all invoices
  getAllInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/user/client/project/quote/invoices');
    return response.data;
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId: string): Promise<Invoice> => {
    const response = await api.get(`/user/client/project/quote/invoices/${invoiceId}`);
    return response.data;
  },

  // Create invoice
  createInvoice: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await api.post('/user/client/project/quote/invoices', data);
    return response.data;
  },

  // Create invoice from quote
  createInvoiceFromQuote: async (quoteId: string, data?: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await api.post(`/user/client/project/quote/invoices/from-quote/${quoteId}`, data);
    return response.data;
  },

  // Update invoice
  updateInvoice: async (invoiceId: string, data: UpdateInvoiceRequest): Promise<Invoice> => {
    const response = await api.put(`/user/client/project/quote/invoices/${invoiceId}`, data);
    return response.data;
  },

  // Delete invoice
  deleteInvoice: async (invoiceId: string): Promise<void> => {
    await api.delete(`/user/client/project/quote/invoices/${invoiceId}`);
  },

  // Send invoice
  sendInvoice: async (invoiceId: string): Promise<Invoice> => {
    const response = await api.post(`/user/client/project/quote/invoices/${invoiceId}/send`);
    return response.data;
  },

  // Cancel invoice
  cancelInvoice: async (invoiceId: string): Promise<Invoice> => {
    const response = await api.post(`/user/client/project/quote/invoices/${invoiceId}/cancel`);
    return response.data;
  },

  // Duplicate invoice
  duplicateInvoice: async (invoiceId: string): Promise<Invoice> => {
    const response = await api.post(`/user/client/project/quote/invoices/${invoiceId}/duplicate`);
    return response.data;
  },

  // Get invoices by status
  getInvoicesByStatus: async (status: string): Promise<Invoice[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/status/${status}`);
    return response.data;
  },

  // Get invoices by client
  getInvoicesByClient: async (clientId: string): Promise<Invoice[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/client/${clientId}`);
    return response.data;
  },

  // Get invoices by project
  getInvoicesByProject: async (projectId: string): Promise<Invoice[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/project/${projectId}`);
    return response.data;
  },

  // Get invoices by quote
  getInvoicesByQuote: async (quoteId: string): Promise<Invoice[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/quote/${quoteId}`);
    return response.data;
  },

  // Search invoices
  searchInvoices: async (query: string): Promise<Invoice[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/search`, {
      params: { query }
    });
    return response.data;
  },

  // Get invoice summary
  getInvoiceSummary: async (invoiceId: string): Promise<InvoiceSummary> => {
    const response = await api.get(`/user/client/project/quote/invoices/${invoiceId}/summary`);
    return response.data;
  },

  // Get invoice aging report
  getInvoiceAgingReport: async (): Promise<InvoiceAgingReport[]> => {
    const response = await api.get('/user/client/project/quote/invoices/aging-report');
    return response.data;
  },

  // Get overdue invoices
  getOverdueInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/user/client/project/quote/invoices/overdue');
    return response.data;
  },

  // Get invoices by due date range
  getInvoicesByDueDateRange: async (startDate: string, endDate: string): Promise<Invoice[]> => {
    const response = await api.get('/user/client/project/quote/invoices/due-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get invoices by issue date range
  getInvoicesByIssueDateRange: async (startDate: string, endDate: string): Promise<Invoice[]> => {
    const response = await api.get('/user/client/project/quote/invoices/issue-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get invoices count
  getInvoicesCount: async (): Promise<number> => {
    const response = await api.get('/user/client/project/quote/invoices/count');
    return response.data;
  },

  // Get invoices count by status
  getInvoicesCountByStatus: async (status: string): Promise<number> => {
    const response = await api.get(`/user/client/project/quote/invoices/count/status/${status}`);
    return response.data;
  },

  // Get total invoiced amount
  getTotalInvoicedAmount: async (): Promise<number> => {
    const response = await api.get('/user/client/project/quote/invoices/total-invoiced');
    return parseFloat(response.data);
  },

  // Get total amount paid
  getTotalAmountPaid: async (): Promise<number> => {
    const response = await api.get('/user/client/project/quote/invoices/total-paid');
    return parseFloat(response.data);
  },

  // Get total balance due
  getTotalBalanceDue: async (): Promise<number> => {
    const response = await api.get('/user/client/project/quote/invoices/total-balance-due');
    return parseFloat(response.data);
  },

  // Get recent invoices
  getRecentInvoices: async (limit: number = 5): Promise<Invoice[]> => {
    const response = await api.get('/user/client/project/quote/invoices/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Update invoice status
  updateInvoiceStatus: async (invoiceId: string, status: string): Promise<Invoice> => {
    const response = await api.patch(`/user/client/project/quote/invoices/${invoiceId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Export invoices to CSV
  exportInvoicesToCSV: async (): Promise<Blob> => {
    const response = await api.get('/user/client/project/quote/invoices/export', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export invoice to PDF
  exportInvoiceToPDF: async (invoiceId: string): Promise<Blob> => {
    const response = await api.get(`/user/client/project/quote/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate payment link
  generatePaymentLink: async (invoiceId: string): Promise<string> => {
    const response = await api.post(`/user/client/project/quote/invoices/${invoiceId}/payment-link`);
    return response.data;
  },

  // ========== INVOICE ITEMS ==========

  // Get invoice items
  getInvoiceItems: async (invoiceId: string): Promise<InvoiceItem[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/${invoiceId}/items`);
    return response.data;
  },

  // Add invoice item
  addInvoiceItem: async (invoiceId: string, data: CreateInvoiceItemRequest): Promise<InvoiceItem> => {
    const response = await api.post(`/user/client/project/quote/invoices/${invoiceId}/items`, data);
    return response.data;
  },

  // Update invoice item
  updateInvoiceItem: async (invoiceId: string, itemId: string, data: UpdateInvoiceItemRequest): Promise<InvoiceItem> => {
    const response = await api.put(`/user/client/project/quote/invoices/${invoiceId}/items/${itemId}`, data);
    return response.data;
  },

  // Delete invoice item
  deleteInvoiceItem: async (invoiceId: string, itemId: string): Promise<void> => {
    await api.delete(`/user/client/project/quote/invoices/${invoiceId}/items/${itemId}`);
  },

  // Reorder invoice items
  reorderInvoiceItems: async (invoiceId: string, itemIdsInOrder: string[]): Promise<void> => {
    await api.post(`/user/client/project/quote/invoices/${invoiceId}/items/reorder`, itemIdsInOrder);
  },

  // ========== PAYMENTS ==========

  // Get invoice payments
  getInvoicePayments: async (invoiceId: string): Promise<InvoicePayment[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/${invoiceId}/payments`);
    return response.data;
  },

  // Add payment
  addPayment: async (invoiceId: string, data: CreatePaymentRequest): Promise<InvoicePayment> => {
    const response = await api.post(`/user/client/project/quote/invoices/${invoiceId}/payments`, data);
    return response.data;
  },

  // Update payment
  updatePayment: async (invoiceId: string, paymentId: string, data: UpdatePaymentRequest): Promise<InvoicePayment> => {
    const response = await api.put(`/user/client/project/quote/invoices/${invoiceId}/payments/${paymentId}`, data);
    return response.data;
  },

  // Delete payment
  deletePayment: async (invoiceId: string, paymentId: string): Promise<void> => {
    await api.delete(`/user/client/project/quote/invoices/${invoiceId}/payments/${paymentId}`);
  },

  // Get payments by status
  getPaymentsByStatus: async (invoiceId: string, status: string): Promise<InvoicePayment[]> => {
    const response = await api.get(`/user/client/project/quote/invoices/${invoiceId}/payments/status/${status}`);
    return response.data;
  },

  // Get total payments for user
  getTotalPaymentsByUser: async (): Promise<number> => {
    const response = await api.get('/user/client/project/quote/invoices/payments/user-total');
    return parseFloat(response.data);
  },

  // Get total payments for client
  getTotalPaymentsByClient: async (clientId: string): Promise<number> => {
    const response = await api.get(`/user/client/project/quote/invoices/payments/client-total/${clientId}`);
    return parseFloat(response.data);
  },

  // ========== PUBLIC ENDPOINTS ==========

  // Get invoice by public hash
  getInvoiceByPublicHash: async (publicHash: string): Promise<Invoice> => {
    const response = await api.get(`/user/client/project/quote/invoices/public/${publicHash}`);
    return response.data;
  },

  // Generate invoice number
  generateInvoiceNumber: async (): Promise<string> => {
    const response = await api.get('/user/client/project/quote/invoices/generate-number');
    return response.data;
  }
};