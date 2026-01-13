import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Filter, 
  Search, 
  Download, 
  Upload, 
  RefreshCw,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Grid,
  List,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/common/DataTable';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { 
  useQuotes, 
  useQuoteStats, 
  useCreateQuote, 
  useUpdateQuote,
  useDeleteQuote,
  useSendQuote,
  useDuplicateQuote,
  useUpdateQuoteStatus,
  useExportQuotes,
  useExportQuotePDF
} from '@/hooks/useQuotes';
import type { 
  Quote, 
  CreateQuoteRequest, 
  UpdateQuoteRequest 
} from '@/types/quote';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const Quotes: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // API Hooks
  const { data: quotesData, isLoading, refetch } = useQuotes(page, pageSize);
  const { data: stats, isLoading: statsLoading } = useQuoteStats();
  
  const createMutation = useCreateQuote();
  const updateMutation = useUpdateQuote();
  const deleteMutation = useDeleteQuote();
  const sendMutation = useSendQuote();
  const duplicateMutation = useDuplicateQuote();
  const updateStatusMutation = useUpdateQuoteStatus();
  const exportMutation = useExportQuotes();
  const exportPDFMutation = useExportQuotePDF();

  // Get quotes array from paginated response
  const quotes = quotesData?.content || [];

  // Filter quotes based on active tab and search
  const filteredQuotes = useMemo(() => {    
    let filtered = quotes;
    
    // Filter by tab
    if (activeTab === 'draft') {
      filtered = filtered.filter(q => q.status === 'draft');
    } else if (activeTab === 'sent') {
      filtered = filtered.filter(q => q.status === 'sent');
    } else if (activeTab === 'accepted') {
      filtered = filtered.filter(q => q.status === 'accepted');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(q => q.status === 'rejected');
    } else if (activeTab === 'expired') {
      filtered = filtered.filter(q => q.status === 'expired');
    } else if (activeTab === 'expiring_soon') {
      filtered = filtered.filter(q => {
        if (!q.validUntil || q.status === 'accepted' || q.status === 'rejected') return false;
        const today = new Date();
        const validUntil = new Date(q.validUntil);
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      });
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) ||
        q.quoteNumber.toLowerCase().includes(query) ||
        q.clientName.toLowerCase().includes(query) ||
        q.summary?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [quotes, activeTab, searchQuery]);

  const handleCreateQuote = async (data: CreateQuoteRequest) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdateQuote = async (data: UpdateQuoteRequest) => {
    if (!selectedQuote) return;
    await updateMutation.mutateAsync({ quoteId: selectedQuote.id, data });
    setIsFormOpen(false);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(quoteId);
    }
  };

  const handleSendQuote = async (quoteId: string) => {
    if (confirm('Are you sure you want to send this quote to the client?')) {
      await sendMutation.mutateAsync(quoteId);
    }
  };

  const handleDuplicateQuote = async (quoteId: string) => {
    await duplicateMutation.mutateAsync(quoteId);
  };

  const handleExportPDF = async (quoteId: string) => {
    await exportPDFMutation.mutateAsync(quoteId);
  };

  // Calculate display ranges for pagination
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, quotesData?.totalElements || 0);

  // Table columns configuration
  const columns: ColumnDef<Quote>[] = useMemo(() => [
    {
      accessorKey: 'quoteNumber',
      header: 'Quote #',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-blue-600">
          #{row.original.quoteNumber}
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
            case 'draft': return <FileText className="h-3 w-3" />;
            case 'sent': return <Send className="h-3 w-3" />;
            case 'accepted': return <CheckCircle className="h-3 w-3" />;
            case 'rejected': return <XCircle className="h-3 w-3" />;
            case 'expired': return <AlertCircle className="h-3 w-3" />;
            default: return null;
          }
        };

        const getStatusColor = () => {
          switch (row.original.status) {
            case 'draft': return 'bg-gray-100 text-gray-700';
            case 'sent': return 'bg-blue-100 text-blue-700';
            case 'accepted': return 'bg-emerald-100 text-emerald-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'expired': return 'bg-amber-100 text-amber-700';
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
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => {
        if (!row.original.validUntil) return 'Not set';
        
        const today = new Date();
        const validUntil = new Date(row.original.validUntil);
        const diffTime = validUntil.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return (
          <div className={`flex items-center gap-1 ${
            diffDays < 0 ? 'text-red-600' : 
            diffDays <= 7 ? 'text-amber-600' : 'text-gray-700'
          }`}>
            <Calendar className="h-3 w-3" />
            {new Date(row.original.validUntil).toLocaleDateString()}
            {row.original.status !== 'accepted' && row.original.status !== 'rejected' && (
              <span className="text-xs">
                ({diffDays < 0 ? 'Expired' : diffDays === 0 ? 'Today' : `${diffDays}d`})
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
            onClick={() => navigate(`/quotes/${row.original.id}`)}
          >
            View
          </Button>
          {row.original.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedQuote(row.original);
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

  // Calculate expiring soon count
  const expiringSoonCount = quotes.filter(q => {
    if (!q.validUntil || q.status === 'accepted' || q.status === 'rejected') return false;
    const today = new Date();
    const validUntil = new Date(q.validUntil);
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Quotes
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage client quotes and proposals
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
              setSelectedQuote(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {statsLoading ? '...' : stats?.totalQuotes || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">all time</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">
                  {statsLoading ? '...' : stats?.acceptedQuotes || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {statsLoading ? '' : `${stats?.acceptanceRate || 0}% rate`}
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
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {expiringSoonCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">within 7 days</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-400">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-purple-50/50 to-pink-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  ${statsLoading ? '...' : stats?.acceptedTotalAmount?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">accepted quotes</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400">
                <TrendingUp className="h-6 w-6 text-white" />
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
                  placeholder="Search quotes..."
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
            All Quotes
          </TabsTrigger>
          <TabsTrigger value="draft" className="rounded-md">
            Draft
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-md">
            Sent
          </TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-md">
            Accepted
          </TabsTrigger>
          <TabsTrigger value="expiring_soon" className="rounded-md">
            Expiring Soon
          </TabsTrigger>
          <TabsTrigger value="expired" className="rounded-md">
            Expired
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading quotes...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              {filteredQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mt-4 text-gray-600">
                    {searchQuery
                      ? `No quotes found for "${searchQuery}"`
                      : 'No quotes found'}
                  </p>
                  {!searchQuery && activeTab === 'all' && (
                    <Button 
                      onClick={() => setIsFormOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Quote
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuotes.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onView={(quote) => navigate(`/quotes/${quote.id}`)}
                      onEdit={(quote) => {
                        setSelectedQuote(quote);
                        setIsFormOpen(true);
                      }}
                      onSend={handleSendQuote}
                      onDuplicate={handleDuplicateQuote}
                      onDelete={handleDeleteQuote}
                      onExportPDF={handleExportPDF}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <DataTable
              data={filteredQuotes}
              columns={columns}
              onAdd={() => setIsFormOpen(true)}
              addLabel="New Quote"
            />
          )}

          {/* Pagination */}
          {!searchQuery && quotesData && quotesData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {endIndex} of {quotesData.totalElements} quotes
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
                  {Array.from({ length: Math.min(5, quotesData.totalPages) }, (_, i) => {
                    let pageNum = i;
                    if (quotesData.totalPages > 5) {
                      if (page < 3) pageNum = i;
                      else if (page > quotesData.totalPages - 3) pageNum = quotesData.totalPages - 5 + i;
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
                  disabled={page >= quotesData.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quote Form Modal */}
      <QuoteForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedQuote(null);
        }}
        onSubmit={async (data) => {
          if (selectedQuote) {
            await handleUpdateQuote(data as UpdateQuoteRequest);
          } else {
            await handleCreateQuote(data as CreateQuoteRequest);
          }
        }}
        initialData={selectedQuote || undefined}
        mode={selectedQuote ? 'edit' : 'create'}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};