import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  color: string;
  gradient: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend, 
  color, 
  gradient 
}) => (
  <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border-0 bg-gradient-to-br from-white via-white to-white/90 backdrop-blur-sm shadow-lg">
    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <CardContent className="pt-6 relative">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend === 'up' ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);