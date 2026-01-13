export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type QuoteAction = 'created' | 'updated' | 'sent' | 'viewed' | 'accepted' | 'rejected';

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
  sortOrder: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  userId: string;
  clientId: string;
  projectId?: string;
  clientName: string;
  clientContactName: string;
  projectName?: string;
  quoteNumber: string;
  title: string;
  summary?: string;
  status: QuoteStatus;
  validUntil?: string;
  termsAndConditions?: string;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  sentAt?: string;
  acceptedAt?: string;
  viewedAt?: string;
  pdfUrl?: string;
  publicHash?: string;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteSummary {
  id: string;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  clientName: string;
  totalAmount: number;
  createdAt: string;
  validUntil?: string;
  daysUntilExpiry?: number;
  viewedAt?: string;
  sentAt?: string;
}

export interface QuoteHistory {
  id: string;
  quoteId: string;
  action: QuoteAction;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

export interface CreateQuoteRequest {
  clientId: string;
  projectId?: string;
  title: string;
  summary?: string;
  validUntil?: string;
  termsAndConditions?: string;
  notes?: string;
  taxAmount?: number;
  discountAmount?: number;
  currency?: string;
  items?: CreateQuoteItemRequest[];
}

export interface UpdateQuoteRequest {
  title?: string;
  summary?: string;
  validUntil?: string;
  termsAndConditions?: string;
  notes?: string;
  taxAmount?: number;
  discountAmount?: number;
  status?: QuoteStatus;
  currency?: string;
}

export interface CreateQuoteItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  sortOrder?: number;
}

export interface UpdateQuoteItemRequest {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  discount?: number;
  sortOrder?: number;
}

export interface QuotesResponse {
  content: Quote[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface QuoteStats {
  totalQuotes: number;
  draftQuotes: number;
  sentQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  expiredQuotes: number;
  acceptedTotalAmount: number;
  averageQuoteValue: number;
  acceptanceRate: number;
}