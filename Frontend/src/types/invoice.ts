export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'cash' | 'check' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
  sortOrder: number;
  createdAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  notes?: string;
  status: PaymentStatus;
  metadata?: any;
  createdAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  projectId?: string;
  quoteId?: string;
  clientName: string;
  clientContactName: string;
  projectName?: string;
  quoteTitle?: string;
  invoiceNumber: string;
  title: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentTerms?: string;
  notes?: string;
  terms?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  sentAt?: string;
  viewedAt?: string;
  pdfUrl?: string;
  publicHash?: string;
  paymentLink?: string;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  title: string;
  status: InvoiceStatus;
  clientName: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  issueDate: string;
  dueDate: string;
  daysUntilDue?: number;
  isOverdue: boolean;
}

export interface InvoiceAgingReport {
  clientName: string;
  totalBalance: number;
  current: number;
  overdue1_30: number;
  overdue31_60: number;
  overdue61_90: number;
  overdue90_plus: number;
}

export interface CreateInvoiceRequest {
  clientId: string;
  projectId?: string;
  quoteId?: string;
  title: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms?: string;
  notes?: string;
  terms?: string;
  taxAmount?: number;
  discountAmount?: number;
  currency?: string;
  items?: CreateInvoiceItemRequest[];
}

export interface UpdateInvoiceRequest {
  title?: string;
  issueDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  terms?: string;
  taxAmount?: number;
  discountAmount?: number;
  status?: InvoiceStatus;
  currency?: string;
}

export interface CreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  sortOrder?: number;
}

export interface UpdateInvoiceItemRequest {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxRate?: number;
  discount?: number;
  sortOrder?: number;
}

export interface CreatePaymentRequest {
  paymentMethod: PaymentMethod;
  transactionId?: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  notes?: string;
  status?: PaymentStatus;
}

export interface UpdatePaymentRequest {
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  amount?: number;
  currency?: string;
  paymentDate?: string;
  notes?: string;
  status?: PaymentStatus;
}

export interface InvoicesResponse {
  content: Invoice[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface InvoiceStats {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  partialInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalInvoicedAmount: number;
  totalAmountPaid: number;
  totalBalanceDue: number;
  averageInvoiceValue: number;
  onTimePaymentRate: number;
  overdueAmount: number;
}