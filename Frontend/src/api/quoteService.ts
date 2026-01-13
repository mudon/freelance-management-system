import api from '@/lib/axios';
import type {
  Quote,
  QuoteItem,
  QuoteSummary,
  QuoteHistory,
  QuoteStats,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  CreateQuoteItemRequest,
  UpdateQuoteItemRequest,
  QuotesResponse
} from '@/types/quote';

export const quoteService = {
  // Get all quotes with pagination
  getQuotesPaginated: async (page: number = 0, size: number = 20): Promise<QuotesResponse> => {
    const response = await api.get(`/user/client/quotes/paginated`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get all quotes
  getAllQuotes: async (): Promise<Quote[]> => {
    const response = await api.get('/user/client/quotes');
    return response.data;
  },

  // Get quote by ID
  getQuoteById: async (quoteId: string): Promise<Quote> => {
    const response = await api.get(`/user/client/quotes/${quoteId}`);
    return response.data;
  },

  // Create quote (with or without items)
  createQuote: async (data: CreateQuoteRequest): Promise<Quote> => {
    console.log(data);
    
    const response = await api.post('/user/client/quotes', data);
    return response.data;
  },

  // Update quote
  updateQuote: async (quoteId: string, data: UpdateQuoteRequest): Promise<Quote> => {
    const response = await api.put(`/user/client/quotes/${quoteId}`, data);
    return response.data;
  },

  // Delete quote
  deleteQuote: async (quoteId: string): Promise<void> => {
    await api.delete(`/user/client/quotes/${quoteId}`);
  },

  // Send quote
  sendQuote: async (quoteId: string): Promise<Quote> => {
    const response = await api.post(`/user/client/quotes/${quoteId}/send`);
    return response.data;
  },

  // Duplicate quote
  duplicateQuote: async (quoteId: string): Promise<Quote> => {
    const response = await api.post(`/user/client/quotes/${quoteId}/duplicate`);
    return response.data;
  },

  // Get quotes by status
  getQuotesByStatus: async (status: string): Promise<Quote[]> => {
    const response = await api.get(`/user/client/quotes/status/${status}`);
    return response.data;
  },

  // Get quotes by client
  getQuotesByClient: async (clientId: string): Promise<Quote[]> => {
    const response = await api.get(`/user/client/quotes/client/${clientId}`);
    return response.data;
  },

  // Get quotes by project
  getQuotesByProject: async (projectId: string): Promise<Quote[]> => {
    const response = await api.get(`/user/client/quotes/project/${projectId}`);
    return response.data;
  },

  // Search quotes
  searchQuotes: async (query: string): Promise<Quote[]> => {
    const response = await api.get(`/user/client/quotes/search`, {
      params: { query }
    });
    return response.data;
  },

  // Get quote summary
  getQuoteSummary: async (quoteId: string): Promise<QuoteSummary> => {
    const response = await api.get(`/user/client/quotes/${quoteId}/summary`);
    return response.data;
  },

  // Get quote history
  getQuoteHistory: async (quoteId: string): Promise<QuoteHistory[]> => {
    const response = await api.get(`/user/client/quotes/${quoteId}/history`);
    return response.data;
  },

  // Get expired quotes
  getExpiredQuotes: async (): Promise<Quote[]> => {
    const response = await api.get('/user/client/quotes/expired');
    return response.data;
  },

  // Get quotes by valid until range
  getQuotesByValidUntilRange: async (startDate: string, endDate: string): Promise<Quote[]> => {
    const response = await api.get('/user/client/quotes/valid-until-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get quotes count
  getQuotesCount: async (): Promise<number> => {
    const response = await api.get('/user/client/quotes/count');
    return response.data;
  },

  // Get quotes count by status
  getQuotesCountByStatus: async (status: string): Promise<number> => {
    const response = await api.get(`/user/client/quotes/count/status/${status}`);
    return response.data;
  },

  // Get accepted quotes total amount
  getAcceptedQuotesTotal: async (): Promise<number> => {
    const response = await api.get('/user/client/quotes/accepted-total');
    return parseFloat(response.data);
  },

  // Get recent quotes
  getRecentQuotes: async (limit: number = 5): Promise<Quote[]> => {
    const response = await api.get('/user/client/quotes/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Update quote status
  updateQuoteStatus: async (quoteId: string, status: string): Promise<Quote> => {
    const response = await api.patch(`/user/client/quotes/${quoteId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Export quotes to CSV
  exportQuotesToCSV: async (): Promise<Blob> => {
    const response = await api.get('/user/client/quotes/export', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export quote to PDF
  exportQuoteToPDF: async (quoteId: string): Promise<Blob> => {
    const response = await api.get(`/user/client/quotes/${quoteId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ========== QUOTE ITEMS ==========

  // Get quote items
  getQuoteItems: async (quoteId: string): Promise<QuoteItem[]> => {
    const response = await api.get(`/user/client/quotes/${quoteId}/items`);
    return response.data;
  },

  // Add quote item
  addQuoteItem: async (quoteId: string, data: CreateQuoteItemRequest): Promise<QuoteItem> => {
    const response = await api.post(`/user/client/quotes/${quoteId}/items`, data);
    return response.data;
  },

  // Update quote item
  updateQuoteItem: async (quoteId: string, itemId: string, data: UpdateQuoteItemRequest): Promise<QuoteItem> => {
    const response = await api.put(`/user/client/quotes/${quoteId}/items/${itemId}`, data);
    return response.data;
  },

  // Delete quote item
  deleteQuoteItem: async (quoteId: string, itemId: string): Promise<void> => {
    await api.delete(`/user/client/quotes/${quoteId}/items/${itemId}`);
  },

  // Reorder quote items
  reorderQuoteItems: async (quoteId: string, itemIdsInOrder: string[]): Promise<void> => {
    await api.post(`/user/client/quotes/${quoteId}/items/reorder`, itemIdsInOrder);
  },

  // ========== PUBLIC ENDPOINTS ==========

  // Get quote by public hash
  getQuoteByPublicHash: async (publicHash: string): Promise<Quote> => {
    const response = await api.get(`/user/client/quotes/public/${publicHash}`);
    return response.data;
  },

  // Accept quote (public)
  acceptQuote: async (publicHash: string): Promise<Quote> => {
    const response = await api.post(`/user/client/quotes/public/${publicHash}/accept`);
    return response.data;
  },

  // Reject quote (public)
  rejectQuote: async (publicHash: string): Promise<Quote> => {
    const response = await api.post(`/user/client/quotes/public/${publicHash}/reject`);
    return response.data;
  },

  // Generate quote PDF preview
  generateQuotePreview: async (data: CreateQuoteRequest): Promise<Blob> => {
    const response = await api.post('/user/client/quotes/preview', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate quote number
  generateQuoteNumber: async (): Promise<string> => {
    const response = await api.get('/user/client/quotes/generate-number');
    return response.data;
  }
};