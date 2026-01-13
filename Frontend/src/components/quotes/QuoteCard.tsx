import React from 'react';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronRight,
  User,
  Building,
  CheckCircle,
  XCircle,
  Send,
  Copy,
  Eye,
  MoreVertical,
  AlertCircle
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
import type { Quote } from '@/types/quote';
import { cn } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote;
  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onSend?: (quoteId: string) => void;
  onDuplicate?: (quoteId: string) => void;
  onDelete?: (quoteId: string) => void;
  onExportPDF?: (quoteId: string) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onView,
  onEdit,
  onSend,
  onDuplicate,
  onDelete,
  onExportPDF,
}) => {
  const getStatusIcon = () => {
    switch (quote.status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (quote.status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDaysUntilExpiry = () => {
    if (!quote.validUntil) return null;
    const today = new Date();
    const validUntil = new Date(quote.validUntil);
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {quote.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {quote.clientName}
                </p>
                <span className="text-gray-400">•</span>
                <p className="text-sm text-gray-600">
                  #{quote.quoteNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn(getStatusColor(), 'gap-2 capitalize')}>
              {getStatusIcon()}
              {quote.status}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(quote)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && quote.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onEdit(quote)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onSend && quote.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onSend(quote.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Quote
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(quote.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onExportPDF && (
                  <DropdownMenuItem onClick={() => onExportPDF(quote.id)}>
                    Export PDF
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(quote.id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {quote.summary && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {quote.summary}
          </p>
        )}

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {quote.totalAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: quote.currency || 'USD'
              })}
            </span>
          </div>

          {quote.validUntil && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Valid Until</span>
              <span className={cn(
                'font-medium flex items-center gap-1',
                isExpired ? 'text-red-600' : 
                isExpiringSoon ? 'text-amber-600' : 'text-gray-900'
              )}>
                <Clock className="h-3 w-3" />
                {new Date(quote.validUntil).toLocaleDateString()}
                {daysUntilExpiry !== null && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    isExpired ? 'bg-red-100 text-red-700' :
                    isExpiringSoon ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {isExpired ? 'Expired' : 
                     daysUntilExpiry === 0 ? 'Today' : 
                     `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`}
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Created</span>
            <span className="font-medium text-gray-900 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(quote.createdAt).toLocaleDateString()}
            </span>
          </div>

          {quote.projectName && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Project</span>
              <span className="font-medium text-gray-900">
                {quote.projectName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {quote.items.length} item{quote.items.length !== 1 ? 's' : ''}
          </div>
          {quote.sentAt && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Sent {new Date(quote.sentAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200/50">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(quote)}
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