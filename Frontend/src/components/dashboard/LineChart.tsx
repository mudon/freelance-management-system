// src/components/dashboard/LineChart.tsx
import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import type { ChartData } from '@/types/dashboard';

interface LineChartProps {
  data: ChartData;
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg space-y-2 min-w-[200px]">
          <p className="font-medium text-gray-900 mb-2 border-b pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 capitalize">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-medium ml-2">
                {entry.name === 'revenue' 
                  ? formatCurrency(entry.value)
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data.datasets}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorInvoices" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#f0f0f0" 
          vertical={false}
        />
        
        <XAxis 
          dataKey="date" 
          stroke="#666"
          tick={{ fill: '#666', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        
        <YAxis 
          stroke="#666"
          tick={{ fill: '#666', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="circle"
          iconSize={8}
        />
        
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#colorRevenue)"
          activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
        />
        
        <Line
          type="monotone"
          dataKey="quotes"
          name="Quotes"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ strokeWidth: 2, r: 3 }}
          activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
        />
        
        <Line
          type="monotone"
          dataKey="invoices"
          name="Invoices"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ strokeWidth: 2, r: 3 }}
          activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
        />
        
        <Line
          type="monotone"
          dataKey="projects"
          name="Projects"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ strokeWidth: 2, r: 3 }}
          activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;