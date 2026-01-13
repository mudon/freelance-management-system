// src/components/dashboard/DashboardStats.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Quote, 
  Receipt, 
  Briefcase, 
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats as DashboardStatsType } from '@/types/dashboard';

interface DashboardStatsProps {
  stats: DashboardStatsType | undefined;
  isLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Quotes',
      value: stats?.totalQuotes || 0,
      icon: Quote,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: stats?.pendingQuotes || 0,
      trendLabel: 'pending',
      trendColor: stats?.pendingQuotes ? 'text-amber-600' : 'text-emerald-600'
    },
    {
      title: 'Total Invoices',
      value: stats?.totalInvoices || 0,
      icon: Receipt,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: stats?.overdueInvoices || 0,
      trendLabel: 'overdue',
      trendColor: stats?.overdueInvoices ? 'text-red-600' : 'text-emerald-600'
    },
    {
      title: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: stats?.totalProjects || 0,
      trendLabel: 'total',
      trendColor: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      trend: stats?.conversionRate || 0,
      trendLabel: 'conversion',
      trendColor: 'text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trendLabel === 'pending' && card.trend > 0 ? (
                    <Clock className="h-4 w-4 text-amber-500" />
                  ) : card.trendLabel === 'overdue' && card.trend > 0 ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  )}
                  <span className={`text-xs ${card.trendColor}`}>
                    {typeof card.trend === 'number' && card.trend > 0 
                      ? `${card.trend} ${card.trendLabel}`
                      : card.trendLabel === 'conversion'
                      ? `${card.trend}% ${card.trendLabel}`
                      : card.title === 'Total Revenue'
                      ? `${stats?.conversionRate || 0}% conversion`
                      : 'All processed'
                    }
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};