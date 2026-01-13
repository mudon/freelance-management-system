import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  DollarSign,
  Clock,
  Send,
  Copy,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Building,
  Edit,
  Trash2,
  Printer,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { 
  useQuote, 
  useQuoteHistory, 
  useDeleteQuote,
  useUpdateQuote,
  useSendQuote,
  useDuplicateQuote,
  useExportQuotePDF
} from '@/hooks/useQuotes';
import { useCreateInvoiceFromQuote, useInvoicesByQuote } from '@/hooks/useInvoices';
import type { UpdateQuoteRequest } from '@/types/quote';
import type { Invoice } from '@/types/invoice';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: quote, isLoading: quoteLoading } = useQuote(id);
  const { data: history, isLoading: historyLoading } = useQuoteHistory(id);
  const { data: existingInvoices } = useInvoicesByQuote(id);
  
  const deleteMutation = useDeleteQuote();
  const updateMutation = useUpdateQuote();
  const sendMutation = useSendQuote();
  const duplicateMutation = useDuplicateQuote();
  const exportPDFMutation = useExportQuotePDF();
  const createInvoiceFromQuoteMutation = useCreateInvoiceFromQuote();

  // Check if invoice already exists for this quote
  const hasExistingInvoice = existingInvoices && existingInvoices.length > 0;
  
  // Check if there's an active (non-cancelled/void) invoice
  const hasActiveInvoice = existingInvoices?.some(
    (invoice: Invoice) => !['cancelled', 'void'].includes(invoice.status)
  );

  const handleDelete = async () => {
    if (id && confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Quote deleted successfully');
        navigate('/quotes');
      } catch (error) {
        toast.error('Failed to delete quote');
      }
    }
  };

  const handleUpdateQuote = async (data: UpdateQuoteRequest) => {
    if (id) {
      try {
        await updateMutation.mutateAsync({ quoteId: id, data });
        toast.success('Quote updated successfully');
        setIsFormOpen(false);
      } catch (error) {
        toast.error('Failed to update quote');
      }
    }
  };

  const handleSend = async () => {
    if (id && confirm('Are you sure you want to send this quote to the client?')) {
      try {
        await sendMutation.mutateAsync(id);
        toast.success('Quote sent successfully!');
      } catch (error) {
        toast.error('Failed to send quote');
      }
    }
  };

  const handleDuplicate = async () => {
    if (id) {
      try {
        await duplicateMutation.mutateAsync(id);
        toast.success('Quote duplicated successfully!');
        navigate('/quotes');
      } catch (error) {
        toast.error('Failed to duplicate quote');
      }
    }
  };

  const handleExportPDF = async () => {
    if (id) {
      try {
        await exportPDFMutation.mutateAsync(id);
      } catch (error) {
        toast.error('Failed to generate PDF');
      }
    }
  };

  // Handle creating invoice from quote
  const handleCreateInvoice = async () => {
    if (!id) return;
    
    // If there are existing invoices, show a confirmation dialog
    if (hasExistingInvoice) {
      const invoiceList = existingInvoices.map((inv: Invoice) => 
        `#${inv.invoiceNumber} (${inv.status})`
      ).join(', ');
      
      const confirmed = confirm(
        `An invoice already exists for this quote: ${invoiceList}\n\nDo you want to create another invoice?`
      );
      
      if (!confirmed) return;
    } else {
      // No existing invoices, confirm creation
      const confirmed = confirm('Create an invoice from this accepted quote?');
      if (!confirmed) return;
    }

    try {
      const invoice = await createInvoiceFromQuoteMutation.mutateAsync({ 
        quoteId: id 
      });
      toast.success('Invoice created successfully!');
      navigate(`/invoices/${invoice.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create invoice from quote');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (quoteLoading) {
    return <LoadingSpinner />;
  }

  if (!quote) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Quote not found</h2>
        <Button onClick={() => navigate('/quotes')} className="mt-4">
          Back to Quotes
        </Button>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (quote.status) {
      case 'draft': return <FileText className="h-5 w-5" />;
      case 'sent': return <Send className="h-5 w-5" />;
      case 'accepted': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      case 'expired': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (quote.status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysUntilExpiry = () => {
    if (!quote.validUntil) return null;
    const today = new Date();
    const validUntil = new Date(quote.validUntil);
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/quotes')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quote.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`${getStatusColor()} gap-2 capitalize`}>
                  {getStatusIcon()}
                  {quote.status}
                </Badge>
                <div className="font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  #{quote.quoteNumber}
                </div>
                {hasExistingInvoice && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-2">
                    <Receipt className="h-3 w-3" />
                    Invoice Created
                  </Badge>
                )}
                {isExpiringSoon && quote.status === 'sent' && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Expiring in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                  </Badge>
                )}
                {isExpired && quote.status !== 'accepted' && quote.status !== 'rejected' && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Expired
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* CREATE INVOICE BUTTON - ONLY FOR ACCEPTED QUOTES WITHOUT ACTIVE INVOICE */}
          {quote.status === 'accepted' && !hasActiveInvoice && (
            <Button
              variant="default"
              onClick={handleCreateInvoice}
              disabled={createInvoiceFromQuoteMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          )}

          {/* VIEW INVOICE BUTTON - IF ACTIVE INVOICE EXISTS */}
          {hasActiveInvoice && (
            <Button
              variant="outline"
              onClick={() => {
                const firstActiveInvoice = existingInvoices?.find(
                  (invoice: Invoice) => !['cancelled', 'void'].includes(invoice.status)
                );
                if (firstActiveInvoice) {
                  navigate(`/invoices/${firstActiveInvoice.id}`);
                }
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
            >
              <Receipt className="h-4 w-4 mr-2" />
              View Invoice
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exportPDFMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          {quote.status === 'draft' && (
            <Button
              variant="outline"
              onClick={handleSend}
              disabled={sendMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFormOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quote Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quote Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {quote.clientName}
                      </p>
                      <p className="text-sm text-gray-600">{quote.clientContactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project</p>
                      {quote.projectName ? (
                        <p className="font-medium text-gray-900">{quote.projectName}</p>
                      ) : (
                        <p className="text-gray-500">No project</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created Date</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valid Until</p>
                      <p className={`font-medium flex items-center gap-1 ${
                        isExpired ? 'text-red-600' : 
                        isExpiringSoon ? 'text-amber-600' : 'text-gray-900'
                      }`}>
                        <Clock className="h-4 w-4" />
                        {quote.validUntil 
                          ? new Date(quote.validUntil).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {quote.summary && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Summary</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{quote.summary}</p>
                    </div>
                  )}

                  {quote.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Internal Notes</p>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Items Subtotal</span>
                        <span className="font-medium">
                          {quote.subtotal.toLocaleString('en-US', {
                            style: 'currency',
                            currency: quote.currency || 'USD'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tax Amount</span>
                        <span className="font-medium">
                          {quote.taxAmount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: quote.currency || 'USD'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Discount Amount</span>
                        <span className="font-medium text-emerald-600">
                          -{quote.discountAmount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: quote.currency || 'USD'
                          })}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold text-lg">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-blue-600">
                          {quote.totalAmount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: quote.currency || 'USD'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={handleExportPDF}
                    disabled={exportPDFMutation.isPending}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  
                  {/* CREATE INVOICE BUTTON IN SIDEBAR - ONLY SHOW IF NO ACTIVE INVOICE */}
                  {quote.status === 'accepted' && !hasActiveInvoice && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={handleCreateInvoice}
                      disabled={createInvoiceFromQuoteMutation.isPending}
                    >
                      <Receipt className="h-4 w-4" />
                      Create Invoice
                    </Button>
                  )}
                  
                  {/* VIEW INVOICE BUTTON IN SIDEBAR */}
                  {hasActiveInvoice && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        const firstActiveInvoice = existingInvoices?.find(
                          (invoice: Invoice) => !['cancelled', 'void'].includes(invoice.status)
                        );
                        if (firstActiveInvoice) {
                          navigate(`/invoices/${firstActiveInvoice.id}`);
                        }
                      }}
                    >
                      <Receipt className="h-4 w-4" />
                      View Invoice
                      {existingInvoices && existingInvoices.length > 1 && (
                        <Badge className="ml-2 bg-purple-100 text-purple-700">
                          {existingInvoices.length}
                        </Badge>
                      )}
                    </Button>
                  )}
                  
                  {quote.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3"
                      onClick={handleSend}
                      disabled={sendMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                      Send to Client
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={handleDuplicate}
                    disabled={duplicateMutation.isPending}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => copyToClipboard(`#${quote.quoteNumber}`)}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Quote Number
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">{quote.clientName}</p>
                      <p className="text-sm text-gray-600">{quote.clientContactName}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/clients/${quote.clientId}`)}
                      className="w-full"
                    >
                      View Client Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {quote.publicHash && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Link
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Share this link with your client to view the quote:
                      </p>
                      <div className="p-2 bg-gray-100 rounded text-sm font-mono text-gray-700 truncate">
                        {`${window.location.origin}/quotes/public/${quote.publicHash}`}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/quotes/public/${quote.publicHash}`)}
                        className="w-full"
                      >
                        Copy Share Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No items added to this quote</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>
                  
                  {quote.items
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
                        <div className="col-span-5">
                          <p className="font-medium">{item.description}</p>
                          <div className="text-sm text-gray-500 mt-1">
                            {item.taxRate > 0 && (
                              <span>Tax: {item.taxRate}%</span>
                            )}
                            {item.discount > 0 && (
                              <span className="ml-2">Discount: {item.discount}%</span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          {item.quantity}
                        </div>
                        <div className="col-span-2 text-right">
                          {item.unitPrice.toLocaleString('en-US', {
                            style: 'currency',
                            currency: quote.currency || 'USD'
                          })}
                        </div>
                        <div className="col-span-3 text-right font-semibold">
                          {item.total.toLocaleString('en-US', {
                            style: 'currency',
                            currency: quote.currency || 'USD'
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Quote History</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {record.action === 'sent' && <Send className="h-4 w-4 text-blue-600" />}
                        {record.action === 'viewed' && <Eye className="h-4 w-4 text-green-600" />}
                        {record.action === 'accepted' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                        {record.action === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                        {(record.action === 'created' || record.action === 'updated') && (
                          <FileText className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium capitalize">{record.action}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {record.description && (
                          <p className="text-gray-600 text-sm mt-1">{record.description}</p>
                        )}
                        {record.ipAddress && (
                          <p className="text-xs text-gray-500 mt-1">
                            IP: {record.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Share with Client</h3>
                  <p className="text-gray-600 mb-4">
                    Share this quote with your client via email or shareable link.
                  </p>
                  
                  {quote.publicHash ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Shareable Link:</p>
                        <div className="p-3 bg-white border rounded-lg">
                          <code className="text-sm break-all">
                            {`${window.location.origin}/quotes/public/${quote.publicHash}`}
                          </code>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => copyToClipboard(`${window.location.origin}/quotes/public/${quote.publicHash}`)}
                          className="flex-1"
                        >
                          Copy Link
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.open(`/quotes/public/${quote.publicHash}`, '_blank')}
                          className="flex-1"
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">
                        Generate a shareable link to send to your client.
                      </p>
                      <Button 
                        onClick={() => {
                          toast.info('Generating shareable link...');
                        }}
                      >
                        Generate Share Link
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Email to Client</h3>
                  <p className="text-gray-600 mb-4">
                    Send this quote directly to your client's email address.
                  </p>
                  <Button 
                    onClick={handleSend}
                    disabled={sendMutation.isPending || quote.status !== 'draft'}
                    className="w-full"
                  >
                    {sendMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send via Email
                      </>
                    )}
                  </Button>
                  {quote.status === 'sent' && (
                    <p className="text-sm text-emerald-600 mt-2">
                      Quote was sent on {quote.sentAt ? new Date(quote.sentAt).toLocaleDateString() : 'unknown date'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Quote Form */}
      <QuoteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleUpdateQuote}
        initialData={quote}
        mode="edit"
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};