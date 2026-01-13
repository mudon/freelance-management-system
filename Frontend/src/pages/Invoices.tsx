import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Filter, 
  Search, 
  Download, 
  RefreshCw,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Percent,
  Grid,
  List,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/common/DataTable';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { 
  useInvoices, 
  useInvoiceStats, 
  useCreateInvoice, 
  useUpdateInvoice,
  useDeleteInvoice,
  useSendInvoice,
  useDuplicateInvoice,
  useUpdateInvoiceStatus,
  useExportInvoices,
  useExportInvoicePDF
} from '@/hooks/useInvoices';
import type { 
  Invoice, 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest 
} from '@/types/invoice';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // API Hooks
  const { data: invoicesData, isLoading, refetch } = useInvoices(page, pageSize);
  const { data: stats, isLoading: statsLoading } = useInvoiceStats();
  
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const deleteMutation = useDeleteInvoice();
  const sendMutation = useSendInvoice();
  const duplicateMutation = useDuplicateInvoice();
  const exportMutation = useExportInvoices();
  const exportPDFMutation = useExportInvoicePDF();

  // Get invoices array from paginated response
  const invoices = invoicesData?.content || [];

  // Filter invoices based on active tab and search
  const filteredInvoices = useMemo(() => {    
    let filtered = invoices;
    
    // Filter by tab
    if (activeTab === 'draft') {
      filtered = filtered.filter(i => i.status === 'draft');
    } else if (activeTab === 'sent') {
      filtered = filtered.filter(i => i.status === 'sent');
    } else if (activeTab === 'viewed') {
      filtered = filtered.filter(i => i.status === 'viewed');
    } else if (activeTab === 'partial') {
      filtered = filtered.filter(i => i.status === 'partial');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(i => i.status === 'paid');
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter(i => i.status === 'overdue');
    } else if (activeTab === 'due_soon') {
      filtered = filtered.filter(i => {
        if (i.status === 'paid' || i.status === 'cancelled') return false;
        const today = new Date();
        const dueDate = new Date(i.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
      });
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(query) ||
        i.invoiceNumber.toLowerCase().includes(query) ||
        i.clientName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [invoices, activeTab, searchQuery]);

  const handleCreateInvoice = async (data: CreateInvoiceRequest) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdateInvoice = async (data: UpdateInvoiceRequest) => {
    if (!selectedInvoice) return;
    await updateMutation.mutateAsync({ invoiceId: selectedInvoice.id, data });
    setIsFormOpen(false);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(invoiceId);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to send this invoice to the client?')) {
      await sendMutation.mutateAsync(invoiceId);
    }
  };

  const handleDuplicateInvoice = async (invoiceId: string) => {
    await duplicateMutation.mutateAsync(invoiceId);
  };

  const handleExportPDF = async (invoiceId: string) => {
    await exportPDFMutation.mutateAsync(invoiceId);
  };

  // Calculate display ranges for pagination
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, invoicesData?.totalElements || 0);

  // Table columns configuration
  const columns: ColumnDef<Invoice>[] = useMemo(() => [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-blue-600">
          #{row.original.invoiceNumber}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.title}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.clientName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const getStatusIcon = () => {
          switch (row.original.status) {
            case 'draft': return <Receipt className="h-3 w-3" />;
            case 'sent': return <AlertCircle className="h-3 w-3" />;
            case 'viewed': return <Eye className="h-3 w-3" />;
            case 'partial': return <Percent className="h-3 w-3" />;
            case 'paid': return <CheckCircle className="h-3 w-3" />;
            case 'overdue': return <AlertCircle className="h-3 w-3" />;
            case 'cancelled': return <AlertCircle className="h-3 w-3" />;
            default: return null;
          }
        };

        const getStatusColor = () => {
          switch (row.original.status) {
            case 'draft': return 'bg-gray-100 text-gray-700';
            case 'sent': return 'bg-blue-100 text-blue-700';
            case 'viewed': return 'bg-purple-100 text-purple-700';
            case 'partial': return 'bg-amber-100 text-amber-700';
            case 'paid': return 'bg-emerald-100 text-emerald-700';
            case 'overdue': return 'bg-red-100 text-red-700';
            case 'cancelled': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
          }
        };

        return (
          <Badge className={`${getStatusColor()} capitalize gap-1`}>
            {getStatusIcon()}
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.totalAmount.toLocaleString('en-US', {
            style: 'currency',
            currency: row.original.currency || 'USD'
          })}
        </div>
      ),
    },
    {
      accessorKey: 'balanceDue',
      header: 'Balance Due',
      cell: ({ row }) => (
        <div className={`font-medium ${
          row.original.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
        }`}>
          {row.original.balanceDue.toLocaleString('en-US', {
            style: 'currency',
            currency: row.original.currency || 'USD'
          })}
        </div>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const today = new Date();
        const dueDate = new Date(row.original.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return (
          <div className={`flex items-center gap-1 ${
            diffDays < 0 && row.original.status !== 'paid' ? 'text-red-600' : 
            diffDays <= 7 && row.original.status !== 'paid' ? 'text-amber-600' : 'text-gray-700'
          }`}>
            <Calendar className="h-3 w-3" />
            {new Date(row.original.dueDate).toLocaleDateString()}
            {row.original.status !== 'paid' && row.original.status !== 'cancelled' && (
              <span className="text-xs">
                ({diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `${diffDays}d`})
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/invoices/${row.original.id}`)}
          >
            View
          </Button>
          {row.original.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedInvoice(row.original);
                setIsFormOpen(true);
              }}
            >
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ], [navigate]);

  // Calculate due soon count
  const dueSoonCount = invoices.filter(i => {
    if (i.status === 'paid' || i.status === 'cancelled') return false;
    const today = new Date();
    const dueDate = new Date(i.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }).length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                Invoices
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your billing and payments
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => exportMutation.mutateAsync()}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => {
              setSelectedInvoice(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoiced</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  ${statsLoading ? '...' : stats?.totalInvoicedAmount?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">all invoices</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">
                  ${statsLoading ? '...' : stats?.paidInvoices?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Due</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  ${statsLoading ? '...' : stats?.totalBalanceDue?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">outstanding</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-400">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-rose-50/50 to-pink-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-rose-900 mt-1">
                  {statsLoading ? '...' : stats?.overdueAmount || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">invoices</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-400">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="all" className="rounded-md">
            All Invoices
          </TabsTrigger>
          <TabsTrigger value="draft" className="rounded-md">
            Draft
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-md">
            Sent
          </TabsTrigger>
          <TabsTrigger value="due_soon" className="rounded-md">
            Due Soon
          </TabsTrigger>
          <TabsTrigger value="overdue" className="rounded-md">
            Overdue
          </TabsTrigger>
          <TabsTrigger value="paid" className="rounded-md">
            Paid
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <Receipt className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mt-4 text-gray-600">
                    {searchQuery
                      ? `No invoices found for "${searchQuery}"`
                      : 'No invoices found'}
                  </p>
                  {!searchQuery && activeTab === 'all' && (
                    <Button 
                      onClick={() => setIsFormOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Invoice
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInvoices.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onView={(invoice) => navigate(`/invoices/${invoice.id}`)}
                      onEdit={(invoice) => {
                        setSelectedInvoice(invoice);
                        setIsFormOpen(true);
                      }}
                      onSend={handleSendInvoice}
                      onDuplicate={handleDuplicateInvoice}
                      onDelete={handleDeleteInvoice}
                      onExportPDF={handleExportPDF}
                      onRecordPayment={(invoiceId) => {
                        // This would open a payment modal
                        navigate(`/invoices/${invoiceId}?tab=payments`);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <DataTable
              data={filteredInvoices}
              columns={columns}
              onAdd={() => setIsFormOpen(true)}
              addLabel="New Invoice"
            />
          )}

          {/* Pagination */}
          {!searchQuery && invoicesData && invoicesData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {endIndex} of {invoicesData.totalElements} invoices
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, invoicesData.totalPages) }, (_, i) => {
                    let pageNum = i;
                    if (invoicesData.totalPages > 5) {
                      if (page < 3) pageNum = i;
                      else if (page > invoicesData.totalPages - 3) pageNum = invoicesData.totalPages - 5 + i;
                      else pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= invoicesData.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invoice Form Modal */}
      <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={async (data) => {
          if (selectedInvoice) {
            await handleUpdateInvoice(data as UpdateInvoiceRequest);
          } else {
            await handleCreateInvoice(data as CreateInvoiceRequest);
          }
        }}
        initialData={selectedInvoice || undefined}
        mode={selectedInvoice ? 'edit' : 'create'}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};