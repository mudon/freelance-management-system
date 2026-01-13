import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, CreditCard, Wallet, Building, Receipt, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { CreatePaymentRequest, UpdatePaymentRequest, PaymentMethod } from '@/types/invoice';

const formSchema = z.object({
  paymentMethod: z.enum(['stripe', 'paypal', 'bank_transfer', 'cash', 'check', 'other']),
  transactionId: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('USD'),
  paymentDate: z.date(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('completed'),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest | UpdatePaymentRequest) => void;
  initialData?: any;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  invoice?: {
    balanceDue: number;
    currency: string;
  };
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isLoading = false,
  invoice,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      paymentMethod: 'bank_transfer',
      transactionId: '',
      amount: invoice?.balanceDue || 0,
      currency: invoice?.currency || 'USD',
      paymentDate: new Date(),
      notes: '',
      status: 'completed',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        paymentMethod: initialData.paymentMethod,
        transactionId: initialData.transactionId || '',
        amount: initialData.amount,
        currency: initialData.currency || 'USD',
        paymentDate: new Date(initialData.paymentDate),
        notes: initialData.notes || '',
        status: initialData.status,
      });
    } else if (invoice) {
      form.reset({
        paymentMethod: 'bank_transfer',
        transactionId: '',
        amount: invoice.balanceDue,
        currency: invoice.currency || 'USD',
        paymentDate: new Date(),
        notes: '',
        status: 'completed',
      });
    }
  }, [initialData, form, invoice]);

  const handleSubmit = (values: FormValues) => {
    const submitData: any = {
      paymentMethod: values.paymentMethod,
      amount: values.amount,
      currency: values.currency,
      paymentDate: format(values.paymentDate, 'yyyy-MM-dd'),
      status: values.status,
    };

    if (values.transactionId) {
      submitData.transactionId = values.transactionId;
    }

    if (values.notes) {
      submitData.notes = values.notes;
    }

    onSubmit(submitData);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'stripe': return <CreditCard className="h-4 w-4" />;
      case 'paypal': return <Wallet className="h-4 w-4" />;
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'check': return <Receipt className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'stripe': return 'Credit Card (Stripe)';
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'check': return 'Check';
      case 'other': return 'Other';
      default: return method;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === 'create' ? 'Record Payment' : 'Edit Payment'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['stripe', 'paypal', 'bank_transfer', 'cash', 'check', 'other'] as PaymentMethod[]).map((method) => (
                          <SelectItem key={method} value={method}>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(method)}
                              {getPaymentMethodLabel(method)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={invoice?.balanceDue}
                          className="pl-8"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </div>
                    </FormControl>
                    {invoice && (
                      <p className="text-xs text-gray-500">
                        Invoice balance: ${invoice.balanceDue.toFixed(2)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., tr_123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Payment details or reference"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {mode === 'create' ? 'Recording...' : 'Updating...'}
                  </div>
                ) : (
                  mode === 'create' ? 'Record Payment' : 'Update Payment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};