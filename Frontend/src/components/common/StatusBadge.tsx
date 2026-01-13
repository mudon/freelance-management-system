import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { StatusType } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variants: Record<string, string> = {
    active: 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200',
    completed: 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-200',
    pending: 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200',
    paid: 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200',
    sent: 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-200',
    overdue: 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200',
    draft: 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-600 border-gray-200',
    accepted: 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200',
    rejected: 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200',
    on_hold: 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200',
    archived: 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-600 border-gray-200',
    cancelled: 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200',
    expired: 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-600 border-gray-200',
    viewed: 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 text-indigo-600 border-indigo-200',
    partial: 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200',
  };

  return (
    <Badge variant="outline" className={`px-3 py-1 rounded-full font-medium ${variants[status] || ''}`}>
      <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
      {status.replace('_', ' ')}
    </Badge>
  );
};