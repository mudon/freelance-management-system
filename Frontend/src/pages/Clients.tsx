import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Filter, 
  Search, 
  Download, 
  Upload, 
  RefreshCw,
  Building,
  UserCheck,
  Archive,
  TrendingUp,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientCard } from '@/components/clients/ClientCard';
import { 
  useClients, 
  useClientStats, 
  useCreateClient, 
  useUpdateClient,
  useArchiveClient,
  useRestoreClient,
  useDeleteClient,
  useExportClients,
  useImportClients
} from '@/hooks/useClients';
import type { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';
import type { ColumnDef } from '@tanstack/react-table';

export const Clients: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // API Hooks
  const { data: clientsData, isLoading, refetch } = useClients(page, pageSize);
  const { data: stats, isLoading: statsLoading } = useClientStats();
  
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const archiveMutation = useArchiveClient();
  const restoreMutation = useRestoreClient();
  const deleteMutation = useDeleteClient();
  const exportMutation = useExportClients();
  const importMutation = useImportClients();

  // Get clients array from paginated response
  const clients = clientsData?.content || [];

  // Filter clients based on active tab and search (client-side filtering)
  const filteredClients = useMemo(() => {    
    let filtered = clients;
    
    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(c => c.status === 'active');
    } else if (activeTab === 'archived') {
      filtered = filtered.filter(c => c.status === 'archived');
    } else if (activeTab === 'recurring') {
      filtered = filtered.filter(c => c.clientCategory === 'recurring');
    } else if (activeTab === 'high-value') {
      filtered = filtered.filter(c => c.clientCategory === 'high-value');
    }
    
    // Filter by search (client-side only works when not using server-side pagination)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.companyName?.toLowerCase().includes(query) ||
        c.contactName?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.clientCategory?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [clients, activeTab, searchQuery]);

  const handleCreateClient = async (data: CreateClientRequest) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdateClient = async (data: UpdateClientRequest) => {
    if (!selectedClient) return;
    await updateMutation.mutateAsync({ clientId: selectedClient.id, data });
    setIsFormOpen(false);
  };

  const handleArchiveClient = async (clientId: string) => {
    if (confirm('Are you sure you want to archive this client?')) {
      await archiveMutation.mutateAsync(clientId);
    }
  };

  const handleRestoreClient = async (clientId: string) => {
    await restoreMutation.mutateAsync(clientId);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(clientId);
    }
  };

  const handleExportClients = async () => {
    await exportMutation.mutateAsync();
  };

  const handleImportClients = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importMutation.mutateAsync(file);
    }
  };

  // Calculate display ranges for pagination
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, clientsData?.totalElements || 0);

  // Table columns configuration
  const columns: ColumnDef<Client>[] = useMemo(() => [
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.original.companyName || row.original.contactName}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.companyName && row.original.contactName 
                ? row.original.contactName 
                : row.original.email || 'No email'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-gray-700">
          {row.original.email || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'clientCategory',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.clientCategory || 'Uncategorized'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'active' ? 'default' : 'secondary'}
          className={`${row.original.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Added',
      cell: ({ row }) => (
        <div className="text-gray-500 text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedClient(row.original);
              setIsFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => row.original.status === 'active' 
              ? handleArchiveClient(row.original.id)
              : handleRestoreClient(row.original.id)
            }
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Clients
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your client relationships and communication
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportClients}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <div>
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportClients}
                />
              </div>
            </Button>
          </label>
          <Button 
            onClick={() => {
              setSelectedClient(null);
              setIsFormOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">
                  {statsLoading ? '...' : stats?.totalClients || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {statsLoading ? '...' : stats?.activeClients || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-purple-50/50 to-pink-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recurring Clients</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {statsLoading ? '...' : stats?.recurringClients || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-400">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived Clients</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">
                  {statsLoading ? '...' : stats?.archivedClients || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-400">
                <Archive className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
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
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="all" className="rounded-md">
            All Clients
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-md">
            Active
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-md">
            Archived
          </TabsTrigger>
          <TabsTrigger value="recurring" className="rounded-md">
            Recurring
          </TabsTrigger>
          <TabsTrigger value="high-value" className="rounded-md">
            High Value
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading clients...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mt-4 text-gray-600">
                    {searchQuery 
                      ? `No clients found for "${searchQuery}"` 
                      : 'No clients found'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onView={setSelectedClient}
                      onEdit={(client) => {
                        setSelectedClient(client);
                        setIsFormOpen(true);
                      }}
                      onArchive={handleArchiveClient}
                      onRestore={handleRestoreClient}
                      onDelete={handleDeleteClient}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <DataTable
              data={filteredClients}
              columns={columns}
              onAdd={() => {
                setSelectedClient(null);
                setIsFormOpen(true);
              }}
              addLabel="Add Client"
            />
          )}

          {/* Pagination - only show for server-side pagination (when not filtering/searching client-side) */}
          {!searchQuery && clientsData && clientsData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {endIndex} of {clientsData.totalElements} clients
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
                  {Array.from({ length: Math.min(5, clientsData.totalPages) }, (_, i) => {
                    let pageNum = i;
                    if (clientsData.totalPages > 5) {
                      if (page < 3) pageNum = i;
                      else if (page > clientsData.totalPages - 3) pageNum = clientsData.totalPages - 5 + i;
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
                  disabled={page >= clientsData.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Client Form Modal */}
      <ClientForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedClient(null);
        }}
        onSubmit={async (data) => {
          if (selectedClient) {
            await handleUpdateClient(data as UpdateClientRequest);
          } else {
            await handleCreateClient(data as CreateClientRequest);
          }
        }}
        initialData={selectedClient || undefined}
        mode={selectedClient ? 'edit' : 'create'}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};