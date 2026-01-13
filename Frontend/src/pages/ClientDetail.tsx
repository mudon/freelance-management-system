import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  FileText,
  Edit,
  Archive,
  Trash2,
  Receipt,
  Briefcase,
  Activity,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ClientForm } from '@/components/clients/ClientForm';
import { useClient, useClientSummary, useArchiveClient, useDeleteClient, useUpdateClient } from '@/hooks/useClients';
import type { UpdateClientRequest } from '@/types/client';
import { toast } from 'sonner';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: client, isLoading: clientLoading } = useClient(id);
  const { data: summary, isLoading: summaryLoading } = useClientSummary(id);
  
  const archiveMutation = useArchiveClient();
  const deleteMutation = useDeleteClient();
  const updateMutation = useUpdateClient();

  const handleArchive = async () => {
    if (id && confirm(`Are you sure you want to ${client?.status === 'active' ? 'archive' : 'restore'} this client?`)) {
      try {
        if (client?.status === 'active') {
          await archiveMutation.mutateAsync(id);
          toast.success('Client archived successfully');
        } else {
          // For restore, you would need to implement this
          toast.info('Restore functionality coming soon');
        }
      } catch (error) {
        toast.error('Failed to update client status');
      }
    }
  };

  const handleDelete = async () => {
    if (id && confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Client deleted successfully');
        navigate('/clients');
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const handleUpdateClient = async (data: UpdateClientRequest) => {
    if (id) {
      try {
        await updateMutation.mutateAsync({ clientId: id, data });
        toast.success('Client updated successfully');
        setIsFormOpen(false);
      } catch (error) {
        toast.error('Failed to update client');
      }
    }
  };

  if (clientLoading) {
    return <LoadingSpinner />;
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
        <Button onClick={() => navigate('/clients')} className="mt-4">
          Back to Clients
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/clients')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-lg">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.companyName}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
                {client.clientCategory && (
                  <Badge variant="outline" className="capitalize">
                    {client.clientCategory}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
          >
            <Archive className="h-4 w-4 mr-2" />
            {client.status === 'active' ? 'Archive' : 'Restore'}
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
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Contact Name</p>
                      <p className="font-medium text-gray-900">{client.contactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      {client.email ? (
                        <a href={`mailto:${client.email}`} className="font-medium text-blue-600 hover:underline">
                          {client.email}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      {client.phone ? (
                        <a href={`tel:${client.phone}`} className="font-medium text-gray-900">
                          {client.phone}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client Since</p>
                      <p className="font-medium text-gray-900">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {client.address && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Address</p>
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{client.address}</p>
                          {client.city && <p>{client.city}, {client.state} {client.postalCode}</p>}
                          {client.country && <p>{client.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {client.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Notes</p>
                      <div className="flex items-start gap-2 text-gray-700">
                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="whitespace-pre-wrap">{client.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary Stats */}
              {summary && !summaryLoading && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Client Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          ${summary.totalPaidAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                        <p className="text-sm text-gray-600">Projects</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {summary.projectCount} ({summary.activeProjectCount} active)
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                        <p className="text-sm text-gray-600">On-time Payment</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {summary.onTimePaymentRate}%
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <p className="text-sm text-gray-600">Engagement</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">
                          {summary.engagementLevel}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Briefcase className="h-4 w-4" />
                    New Project
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <FileText className="h-4 w-4" />
                    New Quote
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Receipt className="h-4 w-4" />
                    New Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <CreditCard className="h-4 w-4" />
                    Record Payment
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: 'Invoice paid', date: '2 days ago', amount: '$2,500' },
                      { action: 'Quote accepted', date: '1 week ago', amount: '$5,000' },
                      { action: 'Project completed', date: '2 weeks ago', amount: null },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                        {item.amount && (
                          <span className="text-sm font-semibold text-emerald-600">
                            {item.amount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Projects will appear here once created</p>
                <Button className="mt-4">Create First Project</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Invoices will appear here once created</p>
                <Button className="mt-4">Create First Invoice</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Client Form */}
      <ClientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleUpdateClient}
        initialData={client}
        mode="edit"
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};