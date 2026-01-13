import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Receipt, 
  Calendar, 
  DollarSign,
  Clock,
  Send,
  Copy,
  Download,
  Share2,
  CheckCircle,
  Percent,
  Eye,
  Building,
  User,
  Edit,
  Trash2,
  Printer,
  CreditCard,
  Plus,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { PaymentForm } from '@/components/invoices/PaymentForm';
import { 
  useInvoice, 
  useInvoiceSummary, 
  useDeleteInvoice,
  useUpdateInvoice,
  useSendInvoice,
  useDuplicateInvoice,
  useExportInvoicePDF,
  useAddPayment,
  useInvoicePayments,
  useDeletePayment
} from '@/hooks/useInvoices';
import type { 
  UpdateInvoiceRequest, 
  CreatePaymentRequest,
  UpdatePaymentRequest 
} from '@/types/invoice';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: invoice, isLoading: invoiceLoading } = useInvoice(id);
  const { data: payments, isLoading: paymentsLoading } = useInvoicePayments(id);
  
  const deleteMutation = useDeleteInvoice();
  const updateMutation = useUpdateInvoice();
  const sendMutation = useSendInvoice();
  const duplicateMutation = useDuplicateInvoice();
  const exportPDFMutation = useExportInvoicePDF();
  const addPaymentMutation = useAddPayment();
  const deletePaymentMutation = useDeletePayment();

  const handleDelete = async () => {
    if (id && confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Invoice deleted successfully');
        navigate('/invoices');
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleUpdateInvoice = async (data: UpdateInvoiceRequest) => {
    if (id) {
      try {
        await updateMutation.mutateAsync({ invoiceId: id, data });
        toast.success('Invoice updated successfully');
        setIsFormOpen(false);
      } catch (error) {
        toast.error('Failed to update invoice');
      }
    }
  };

  const handleSend = async () => {
    if (id && confirm('Are you sure you want to send this invoice to the client?')) {
      try {
        await sendMutation.mutateAsync(id);
        toast.success('Invoice sent successfully!');
      } catch (error) {
        toast.error('Failed to send invoice');
      }
    }
  };

  const handleDuplicate = async () => {
    if (id) {
      try {
        await duplicateMutation.mutateAsync(id);
        toast.success('Invoice duplicated successfully!');
        navigate('/invoices');
      } catch (error) {
        toast.error('Failed to duplicate invoice');
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

  const handleAddPayment = async (data: CreatePaymentRequest) => {
    if (id) {
      try {
        await addPaymentMutation.mutateAsync({ invoiceId: id, data });
        toast.success('Payment recorded successfully!');
        setIsPaymentFormOpen(false);
      } catch (error) {
        toast.error('Failed to record payment');
      }
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (id && confirm('Are you sure you want to delete this payment record?')) {
      try {
        await deletePaymentMutation.mutateAsync({ invoiceId: id, paymentId });
        toast.success('Payment deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete payment');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (invoiceLoading) {
    return <LoadingSpinner />;
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'draft': return <Receipt className="h-5 w-5" />;
      case 'sent': return <Send className="h-5 w-5" />;
      case 'viewed': return <Eye className="h-5 w-5" />;
      case 'partial': return <Percent className="h-5 w-5" />;
      case 'paid': return <CheckCircle className="h-5 w-5" />;
      case 'overdue': return <AlertCircle className="h-5 w-5" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (invoice.status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'partial':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0;
  const isOverdue = daysUntilDue < 0 && invoice.status !== 'paid' && invoice.status !== 'cancelled';

  const getPaymentProgress = () => {
    if (invoice.totalAmount === 0) return 0;
    return Math.round((invoice.amountPaid / invoice.totalAmount) * 100);
  };

  const paymentProgress = getPaymentProgress();

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'paypal': return <Building className="h-4 w-4" />;
      case 'bank_transfer': return <TrendingUp className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'check': return <Receipt className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'stripe': return 'Credit Card';
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'check': return 'Check';
      case 'other': return 'Other';
      default: return method;
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/invoices')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg">
              <Receipt className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{invoice.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`${getStatusColor()} gap-2 capitalize`}>
                  {getStatusIcon()}
                  {invoice.status}
                </Badge>
                <div className="font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  #{invoice.invoiceNumber}
                </div>
                {isDueSoon && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-2">
                    <Clock className="h-3 w-3" />
                    Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                  </Badge>
                )}
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
          {invoice.status === 'draft' && (
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
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoice Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {invoice.clientName}
                      </p>
                      <p className="text-sm text-gray-600">{invoice.clientContactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project</p>
                      {invoice.projectName ? (
                        <p className="font-medium text-gray-900">{invoice.projectName}</p>
                      ) : (
                        <p className="text-gray-500">No project</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className={`font-medium flex items-center gap-1 ${
                        isOverdue ? 'text-red-600' : 
                        isDueSoon ? 'text-amber-600' : 'text-gray-900'
                      }`}>
                        <Clock className="h-4 w-4" />
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Terms</p>
                      <p className="font-medium text-gray-900">
                        {invoice.paymentTerms || 'Net 30'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quote</p>
                      {invoice.quoteTitle ? (
                        <p className="font-medium text-gray-900">{invoice.quoteTitle}</p>
                      ) : (
                        <p className="text-gray-500">No quote</p>
                      )}
                    </div>
                  </div>

                  {invoice.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Internal Notes</p>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
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
                  <div className="space-y-6">
                    {/* Payment Progress */}
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'draft' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                          <span className="font-semibold text-gray-900">{paymentProgress}%</span>
                        </div>
                        <Progress value={paymentProgress} className="h-2" />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Paid: ${invoice.amountPaid.toFixed(2)}</span>
                          <span>Due: ${invoice.balanceDue.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Items Subtotal</span>
                        <span className="font-medium">
                          ${invoice.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tax Amount</span>
                        <span className="font-medium">
                          ${invoice.taxAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Discount Amount</span>
                        <span className="font-medium text-emerald-600">
                          -${invoice.discountAmount.toFixed(2)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold text-lg">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-blue-600">
                          ${invoice.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      {invoice.amountPaid > 0 && (
                        <>
                          <div className="flex items-center justify-between text-emerald-600">
                            <span>Amount Paid</span>
                            <span className="font-medium">
                              ${invoice.amountPaid.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-semibold">
                            <span className={invoice.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                              Balance Due
                            </span>
                            <span className={invoice.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                              ${invoice.balanceDue.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar */}
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
                  {invoice.status === 'draft' && (
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
                    onClick={() => setIsPaymentFormOpen(true)}
                    disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                  >
                    <CreditCard className="h-4 w-4" />
                    Record Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={handleDuplicate}
                    disabled={duplicateMutation.isPending}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate Invoice
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => copyToClipboard(`#${invoice.invoiceNumber}`)}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Invoice Number
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
                      <p className="text-sm font-medium">{invoice.clientName}</p>
                      <p className="text-sm text-gray-600">{invoice.clientContactName}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/clients/${invoice.clientId}`)}
                      className="w-full"
                    >
                      View Client Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {invoice.publicHash && (
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
                        Share this link with your client to view the invoice:
                      </p>
                      <div className="p-2 bg-gray-100 rounded text-sm font-mono text-gray-700 truncate">
                        {`${window.location.origin}/invoices/public/${invoice.publicHash}`}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/invoices/public/${invoice.publicHash}`)}
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
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No items added to this invoice</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>
                  
                  {invoice.items
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
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
                          ${item.unitPrice.toFixed(2)}
                        </div>
                        <div className="col-span-3 text-right font-semibold">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-6">
            {/* Record Payment Button */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Payment History</h3>
                <p className="text-sm text-gray-600">
                  Track all payments for this invoice
                </p>
              </div>
              <Button
                onClick={() => setIsPaymentFormOpen(true)}
                disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>

            {/* Payments List */}
            <Card>
              <CardContent className="p-6">
                {paymentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {getPaymentMethodLabel(payment.paymentMethod)}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {new Date(payment.paymentDate).toLocaleDateString()}
                                {payment.transactionId && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-mono text-xs">{payment.transactionId}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">
                              ${payment.amount.toFixed(2)}
                            </p>
                            <Badge 
                              variant={
                                payment.status === 'completed' ? 'default' : 
                                payment.status === 'pending' ? 'outline' :
                                'destructive'
                              }
                              className="mt-1"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                        {payment.notes && (
                          <p className="text-sm text-gray-600 mt-3">{payment.notes}</p>
                        )}
                        <div className="flex justify-end gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsPaymentFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No payments recorded for this invoice</p>
                    <Button 
                      onClick={() => setIsPaymentFormOpen(true)}
                      className="mt-4"
                      disabled={invoice.status === 'paid' || invoice.status === 'cancelled'}
                    >
                      Record First Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">${invoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="font-medium text-emerald-600">
                      ${invoice.amountPaid.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span className={invoice.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      Balance Due
                    </span>
                    <span className={invoice.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      ${invoice.balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Share with Client</h3>
                  <p className="text-gray-600 mb-4">
                    Share this invoice with your client via email or shareable link.
                  </p>
                  
                  {invoice.publicHash ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Shareable Link:</p>
                        <div className="p-3 bg-white border rounded-lg">
                          <code className="text-sm break-all">
                            {`${window.location.origin}/invoices/public/${invoice.publicHash}`}
                          </code>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => copyToClipboard(`${window.location.origin}/invoices/public/${invoice.publicHash}`)}
                          className="flex-1"
                        >
                          Copy Link
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.open(`/invoices/public/${invoice.publicHash}`, '_blank')}
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
                          // This would call an API to generate the public hash
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
                    Send this invoice directly to your client's email address.
                  </p>
                  <Button 
                    onClick={handleSend}
                    disabled={sendMutation.isPending || invoice.status !== 'draft'}
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
                  {invoice.status === 'sent' && (
                    <p className="text-sm text-emerald-600 mt-2">
                      Invoice was sent on {invoice.sentAt ? new Date(invoice.sentAt).toLocaleDateString() : 'unknown date'}
                    </p>
                  )}
                </div>

                {invoice.balanceDue > 0 && invoice.status !== 'cancelled' && (
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Payment Link</h3>
                    <p className="text-gray-600 mb-4">
                      Generate a payment link for your client to pay online.
                    </p>
                    <Button 
                      onClick={() => {
                        // This would generate a payment link
                        toast.info('Generating payment link...');
                      }}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Generate Payment Link
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Invoice Form */}
      <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleUpdateInvoice}
        initialData={invoice}
        mode="edit"
        isLoading={updateMutation.isPending}
      />

      {/* Payment Form */}
      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={() => {
          setIsPaymentFormOpen(false);
          setSelectedPayment(null);
        }}
        onSubmit={handleAddPayment}
        initialData={selectedPayment}
        mode={selectedPayment ? 'edit' : 'create'}
        isLoading={addPaymentMutation.isPending}
        invoice={{
          balanceDue: invoice.balanceDue,
          currency: invoice.currency || 'USD'
        }}
      />
    </div>
  );
};