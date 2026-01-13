import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  
} from '@tanstack/react-table';
import type { ColumnDef, SortingState, } from '@tanstack/react-table';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  onAdd: () => void;
  addLabel?: string;
}

export function DataTable<T>({ data, columns, onAdd, addLabel = "Add New" }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white via-white to-white/90">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Records</CardTitle>
            <CardDescription>Manage your business records</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full sm:w-64"
              />
            </div>
            <Button 
              onClick={onAdd} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200/50 transition-colors duration-200"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/50 transition-all duration-200">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-gray-100/30">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of {data.length} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="gap-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="gap-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              Next →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}