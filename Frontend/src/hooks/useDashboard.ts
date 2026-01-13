// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/dashboardService';
import type { DashboardData, ChartData } from '@/types/dashboard';

export const useDashboardData = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-data'],
    queryFn: dashboardService.getDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: true
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getDashboardStats,
    staleTime: 2 * 60 * 1000,
    retry: 2
  });
};

export const useChartData = (period: string = '30d') => {
  return useQuery<ChartData>({
    queryKey: ['chart-data', period],
    queryFn: () => dashboardService.getChartData(period),
    staleTime: 2 * 60 * 1000,
    retry: 2
  });
};

export const useRecentClients = (limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-clients', limit],
    queryFn: () => dashboardService.getRecentClients(limit),
    staleTime: 2 * 60 * 1000,
    retry: 2
  });
};

export const useQuotesOverview = () => {
  return useQuery({
    queryKey: ['quotes-overview'],
    queryFn: dashboardService.getQuotesOverview,
    staleTime: 2 * 60 * 1000,
    retry: 2
  });
};

export const useInvoicesOverview = () => {
  return useQuery({
    queryKey: ['invoices-overview'],
    queryFn: dashboardService.getInvoicesOverview,
    staleTime: 2 * 60 * 1000,
    retry: 2
  });
};

export const useProjectsOverview = () => {
  return useQuery({
    queryKey: ['projects-overview'],
    queryFn: dashboardService.getProjectsOverview,
    staleTime: 2 * 60 * 1000,
    retry: 2
  });
};