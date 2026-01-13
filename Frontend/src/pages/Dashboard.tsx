// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useDashboardData, 
  useChartData 
} from '@/hooks/useDashboard';
import {
  BarChart3,
  FileText,
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Sparkles,
  Quote,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  ArrowRight,
  Plus,
  Search,
  RefreshCw,
  PieChart,
  BarChart,
  Wallet,
  Target,
  TrendingDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import LineChart from '@/components/dashboard/LineChart';
import { formatCurrency, formatDate } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading,
    refetch,
    isRefetching 
  } = useDashboardData();

  const { data: chartData, isLoading: chartLoading } = useChartData(chartPeriod);

  const isLoading = dashboardLoading || chartLoading;
  
  const stats = dashboardData?.stats;
  const clients = dashboardData?.clients || [];
  const quotes = dashboardData?.quotes;
  const invoices = dashboardData?.invoices;
  const projects = dashboardData?.projects;

  // Filter clients based on search
  const filteredClients = searchQuery
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clients;

  const handleExport = () => {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'dashboard-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleViewAll = (type: 'quotes' | 'invoices' | 'projects' | 'clients') => {
    navigate(`/${type}`);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('accepted') || statusLower.includes('paid') || statusLower.includes('completed')) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (statusLower.includes('pending') || statusLower.includes('draft')) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (statusLower.includes('overdue') || statusLower.includes('rejected') || statusLower.includes('cancelled')) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (statusLower.includes('hold') || statusLower.includes('on_hold')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (statusLower.includes('expired')) {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (isLoading && !dashboardData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Real-time overview of your business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate('/projects/new')}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats stats={stats} isLoading={dashboardLoading} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Business Performance</CardTitle>
                <CardDescription>
                  Real data from your quotes, invoices, and projects
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={chartPeriod} onValueChange={setChartPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {chartLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : chartData && chartData.datasets.length > 0 ? (
                  <LineChart data={chartData} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm">Start creating projects and invoices to see charts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Clients Table */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Clients</CardTitle>
                <CardDescription>
                  Clients with their project and financial activity
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search clients..." 
                    className="pl-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => handleViewAll('clients')} 
                  className="gap-2"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{client.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{client.company}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            <Briefcase className="h-3 w-3" />
                            {client.totalProjects}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Receipt className="h-3 w-3" />
                            {client.totalInvoices}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(client.totalValue)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clients/${client.id}`);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Client
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate('/projects', { state: { clientId: client.id } });
                            }}>
                              <Briefcase className="h-4 w-4 mr-2" />
                              View Projects
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate('/invoices', { state: { clientId: client.id } });
                            }}>
                              <Receipt className="h-4 w-4 mr-2" />
                              View Invoices
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredClients.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">
                    {searchQuery ? 'No clients found' : 'No clients yet'}
                  </p>
                  <p className="text-sm mt-1">
                    {searchQuery ? 'Try a different search term' : 'Get started by adding your first client'}
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/clients/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Overview Cards */}
        <div className="space-y-6">
          {/* Quotes Overview */}
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Quote className="h-5 w-5 text-blue-600" />
                  Quotes
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  {quotes?.total || 0}
                  <span className="text-xs">Total</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-600">Accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{quotes?.accepted || 0}</span>
                    <span className="text-xs text-emerald-600">
                      {quotes?.total ? `${Math.round((quotes.accepted / quotes.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{quotes?.pending || 0}</span>
                    <span className="text-xs text-amber-600">
                      {quotes?.total ? `${Math.round((quotes.pending / quotes.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">Rejected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{quotes?.rejected || 0}</span>
                    <span className="text-xs text-red-600">
                      {quotes?.total ? `${Math.round((quotes.rejected / quotes.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(quotes?.totalValue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Accepted Value</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(quotes?.acceptedValue || 0)}
                    </span>
                  </div>
                </div>
              </div>
              <Progress 
                value={quotes?.total ? ((quotes.accepted || 0) / quotes.total) * 100 : 0} 
                className="h-2" 
              />
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={() => handleViewAll('quotes')}
              >
                <Eye className="h-4 w-4" />
                View All Quotes
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardFooter>
          </Card>

          {/* Invoices Overview */}
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                  Invoices
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  {invoices?.total || 0}
                  <span className="text-xs">Total</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-600">Paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{invoices?.paid || 0}</span>
                    <span className="text-xs text-emerald-600">
                      {invoices?.total ? `${Math.round((invoices.paid / invoices.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{invoices?.pending || 0}</span>
                    <span className="text-xs text-amber-600">
                      {invoices?.total ? `${Math.round((invoices.pending / invoices.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">Overdue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{invoices?.overdue || 0}</span>
                    <span className="text-xs text-red-600">
                      {invoices?.total ? `${Math.round((invoices.overdue / invoices.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">
                      {formatCurrency(invoices?.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-medium text-emerald-600">
                      {formatCurrency(invoices?.totalPaid || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Balance Due</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(invoices?.totalDue || 0)}
                    </span>
                  </div>
                </div>
              </div>
              <Progress 
                value={invoices?.total ? ((invoices.paid || 0) / invoices.total) * 100 : 0} 
                className="h-2" 
              />
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={() => handleViewAll('invoices')}
              >
                <Eye className="h-4 w-4" />
                View All Invoices
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardFooter>
          </Card>

          {/* Projects Overview */}
          <Card className="border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  Projects
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  {projects?.total || 0}
                  <span className="text-xs">Total</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{projects?.active || 0}</span>
                    <span className="text-xs text-blue-600">
                      {projects?.total ? `${Math.round((projects.active / projects.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{projects?.completed || 0}</span>
                    <span className="text-xs text-emerald-600">
                      {projects?.total ? `${Math.round((projects.completed / projects.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-600">On Hold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{projects?.onHold || 0}</span>
                    <span className="text-xs text-amber-600">
                      {projects?.total ? `${Math.round((projects.onHold / projects.total) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Hours</span>
                    <span className="font-medium">
                      {projects?.totalHours?.toLocaleString() || 0} hrs
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-medium text-purple-600">
                      {formatCurrency(projects?.totalValue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Value</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(projects?.activeValue || 0)}
                    </span>
                  </div>
                </div>
              </div>
              <Progress 
                value={projects?.total ? ((projects.completed || 0) / projects.total) * 100 : 0} 
                className="h-2" 
              />
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={() => handleViewAll('projects')}
              >
                <Eye className="h-4 w-4" />
                View All Projects
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Financial Summary */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Overview of your revenue, payments, and outstanding balances
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => navigate('/invoices')}
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-emerald-600">From paid invoices</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Wallet className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 font-medium">Outstanding Balance</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(stats?.totalBalanceDue || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-600">
                  {invoices?.overdue || 0} invoices overdue
                </span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.conversionRate || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-blue-600">
                  {quotes?.accepted || 0} of {quotes?.total || 0} accepted
                </span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Active Projects Value</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(projects?.activeValue || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-purple-600">
                  {projects?.active || 0} active projects
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};