import React from 'react';
import { 
  Receipt, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronRight,
  User,
  Building,
  CheckCircle,
  Send,
  Download,
  Eye,
  MoreVertical,
  AlertCircle,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Invoice } from '@/types/invoice';
import { cn } from '@/lib/utils';

interface InvoiceCardProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onSend?: (invoiceId: string) => void;
  onDuplicate?: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
  onExportPDF?: (invoiceId: string) => void;
  onRecordPayment?: (invoiceId: string) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onView,
  onEdit,
  onSend,
  onDuplicate,
  onDelete,
  onExportPDF,
  onRecordPayment,
}) => {
  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'draft': return <Receipt className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'partial': return <Percent className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (invoice.status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'partial':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0;
  const isOverdue = daysUntilDue < 0 && invoice.status !== 'paid' && invoice.status !== 'cancelled';

  const getPaymentProgress = () => {
    if (invoice.totalAmount === 0) return 0;
    return Math.round((invoice.amountPaid / invoice.totalAmount) * 100);
  };

  const paymentProgress = getPaymentProgress();

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition-colors">
                {invoice.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {invoice.clientName}
                </p>
                <span className="text-gray-400">•</span>
                <p className="text-sm text-gray-600">
                  #{invoice.invoiceNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn(getStatusColor(), 'gap-2 capitalize')}>
              {getStatusIcon()}
              {invoice.status}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(invoice)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && invoice.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onEdit(invoice)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onSend && invoice.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onSend(invoice.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </DropdownMenuItem>
                )}
                {onRecordPayment && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <DropdownMenuItem onClick={() => onRecordPayment(invoice.id)}>
                    Record Payment
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(invoice.id)}>
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onExportPDF && (
                  <DropdownMenuItem onClick={() => onExportPDF(invoice.id)}>
                    Export PDF
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(invoice.id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {invoice.totalAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: invoice.currency || 'USD'
              })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Due Date</span>
            <span className={cn(
              'font-medium flex items-center gap-1',
              isOverdue ? 'text-red-600' : 
              isDueSoon ? 'text-amber-600' : 'text-gray-900'
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(invoice.dueDate).toLocaleDateString()}
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  isOverdue ? 'bg-red-100 text-red-700' :
                  isDueSoon ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  {isOverdue ? 'Overdue' : 
                   daysUntilDue === 0 ? 'Today' : 
                   `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
                </span>
              )}
            </span>
          </div>

          {/* Payment Progress */}
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'draft' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {invoice.amountPaid > 0 ? 'Payment Progress' : 'Pending Payment'}
                </span>
                <span className="font-semibold text-gray-900">
                  {paymentProgress}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    paymentProgress === 100 
                      ? 'bg-emerald-400'
                      : paymentProgress > 0
                      ? 'bg-amber-400'
                      : 'bg-blue-400'
                  )}
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Paid: {invoice.amountPaid.toLocaleString('en-US', {
                    style: 'currency',
                    currency: invoice.currency || 'USD'
                  })}
                </span>
                <span>
                  Due: {invoice.balanceDue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: invoice.currency || 'USD'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
          </div>
          {invoice.sentAt && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Sent {new Date(invoice.sentAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200/50">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(invoice)}
            className="group/btn w-full justify-center"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};