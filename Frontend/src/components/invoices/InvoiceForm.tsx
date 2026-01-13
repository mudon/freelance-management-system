import React, { useEffect, useState } from 'react';
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
import { CalendarIcon, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useQuotesByClient } from '@/hooks/useQuotes';
import { useGenerateInvoiceNumber } from '@/hooks/useInvoices';
import type { CreateInvoiceRequest, UpdateInvoiceRequest, CreateInvoiceItemRequest } from '@/types/invoice';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import type { DropResult  } from '@hello-pangea/dnd';

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).max(100).default(0),
});

const formSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  quoteId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  issueDate: z.date(),
  dueDate: z.date(),
  paymentTerms: z.string().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled']).default('draft'),
  terms: z.string().optional(),
  notes: z.string().optional(),
  taxAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  currency: z.string().default('USD'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvoiceRequest | UpdateInvoiceRequest) => void;
  initialData?: any;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  fromQuote?: {
    quoteId: string;
    quoteData: any;
  };
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isLoading = false,
  fromQuote,
}) => {
  const { data: clientsData } = useClients(0, 100);
  const { data: projectsData } = useProjects(0, 100);
  const { data: generatedInvoiceNumber } = useGenerateInvoiceNumber();
  const { data: quotesData } = useQuotesByClient(initialData?.clientId);
  
  const clients = clientsData?.content || [];
  const projects = projectsData?.content || [];
  const quotes = quotesData || [];
  const [items, setItems] = useState<CreateInvoiceItemRequest[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      clientId: '',
      projectId: '',
      quoteId: '',
      invoiceNumber: generatedInvoiceNumber || '',
      title: '',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentTerms: 'Net 30',
      status: 'draft',
      terms: '',
      notes: '',
      taxAmount: 0,
      discountAmount: 0,
      currency: 'USD',
      items: [],
    },
  });

  // Initialize form with data
  useEffect(() => {
    if (fromQuote) {
      const quote = fromQuote.quoteData;
      const quoteItems = quote.items?.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        discount: item.discount || 0,
        sortOrder: item.sortOrder || 0,
      })) || [];

      form.reset({
        clientId: quote.clientId,
        projectId: quote.projectId || '',
        quoteId: fromQuote.quoteId,
        invoiceNumber: generatedInvoiceNumber || '',
        title: `${quote.title} - Invoice`,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentTerms: 'Net 30',
        status: 'draft',
        terms: quote.termsAndConditions || '',
        notes: quote.notes || '',
        taxAmount: quote.taxAmount || 0,
        discountAmount: quote.discountAmount || 0,
        currency: quote.currency || 'USD',
        items: quoteItems,
      });
      setItems(quoteItems);
    } else if (initialData) {
      form.reset({
        clientId: initialData.clientId,
        projectId: initialData.projectId || '',
        quoteId: initialData.quoteId || '',
        invoiceNumber: initialData.invoiceNumber,
        title: initialData.title,
        issueDate: new Date(initialData.issueDate),
        dueDate: new Date(initialData.dueDate),
        paymentTerms: initialData.paymentTerms || 'Net 30',
        status: initialData.status,
        terms: initialData.terms || '',
        notes: initialData.notes || '',
        taxAmount: initialData.taxAmount || 0,
        discountAmount: initialData.discountAmount || 0,
        currency: initialData.currency || 'USD',
        items: initialData.items || [],
      });
      if (initialData.items) {
        setItems(initialData.items);
      }
      setSelectedClientId(initialData.clientId);
    } else {
      form.reset({
        clientId: '',
        projectId: '',
        quoteId: '',
        invoiceNumber: generatedInvoiceNumber || '',
        title: '',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentTerms: 'Net 30',
        status: 'draft',
        terms: '',
        notes: '',
        taxAmount: 0,
        discountAmount: 0,
        currency: 'USD',
        items: [],
      });
      setItems([{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0, sortOrder: 0 }]);
    }
  }, [initialData, form, generatedInvoiceNumber, fromQuote]);

  useEffect(() => {
    form.setValue('items', items as any);
  }, [items, form]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    form.setValue('clientId', clientId);
    // Clear project and quote when client changes
    form.setValue('projectId', '');
    form.setValue('quoteId', '');
  };

  const handleSubmit = (values: FormValues) => {
    const submitData: any = {
      clientId: values.clientId,
      title: values.title,
      issueDate: format(values.issueDate, 'yyyy-MM-dd'),
      dueDate: format(values.dueDate, 'yyyy-MM-dd'),
      paymentTerms: values.paymentTerms,
      terms: values.terms,
      notes: values.notes,
      taxAmount: values.taxAmount,
      discountAmount: values.discountAmount,
      currency: values.currency,
      items: values.items,
    };

    if (values.projectId) {
      submitData.projectId = values.projectId;
    }

    if (values.quoteId) {
      submitData.quoteId = values.quoteId;
    }

    if (values.invoiceNumber) {
      submitData.invoiceNumber = values.invoiceNumber;
    }

    // For edit mode, include status if changed
    if (mode === 'edit' && initialData?.status !== values.status) {
      submitData.status = values.status;
    }

    onSubmit(submitData);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    // Update sort orders
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0, sortOrder: items.length }
    ]);
  };

  const updateItem = (index: number, field: keyof CreateInvoiceItemRequest, value: any) => {
    const newItems = [...items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === 'description' ? value : parseFloat(value) || 0,
      sortOrder: index
    };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      // Update sort orders
      const updatedItems = newItems.map((item, i) => ({
        ...item,
        sortOrder: i,
      }));
      setItems(updatedItems);
    }
  };

  const calculateItemTotal = (item: CreateInvoiceItemRequest) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount! / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (item.taxRate! / 100);
    return subtotal - discountAmount + taxAmount;
  };

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const subtotal = itemsTotal;
    const taxAmount = form.watch('taxAmount') || 0;
    const discountAmount = form.watch('discountAmount') || 0;
    const total = subtotal + taxAmount - discountAmount;
    
    return { subtotal, taxAmount, discountAmount, total };
  };

  const totals = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {mode === 'create' 
              ? fromQuote 
                ? 'Create Invoice from Quote' 
                : 'Create New Invoice'
              : 'Edit Invoice'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Invoice Number and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Auto-generated" 
                        {...field}
                        value={field.value || generatedInvoiceNumber || ''}
                        readOnly={mode === 'edit'}
                      />
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="viewed">Viewed</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client, Project, and Quote Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={handleClientChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients
                          .filter(client => client.status === 'active')
                          .map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.companyName || client.contactName}
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {projects
                          .filter(project => project.status === 'active')
                          .map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
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
                name="quoteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a quote" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No quote</SelectItem>
                        {quotes
                          .filter(quote => quote.status === 'accepted' || quote.status === 'sent')
                          .map((quote) => (
                            <SelectItem key={quote.id} value={quote.id}>
                              #{quote.quoteNumber} - {quote.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Invoice Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Website Development Services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates and Payment Terms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date *</FormLabel>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date *</FormLabel>
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
                          disabled={(date) => date < new Date()}
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
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                        <SelectItem value="Net 7">Net 7</SelectItem>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Net 90">Net 90</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <FormLabel>Items *</FormLabel>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="invoice-items">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {items.map((item, index) => (
                        <Draggable key={index} draggableId={`item-${index}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="p-4 border rounded-lg bg-white shadow-sm"
                            >
                              <div className="flex items-start gap-4">
                                <div {...provided.dragHandleProps} className="mt-2 cursor-move">
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                  {/* Description */}
                                  <div className="md:col-span-5">
                                    <label className="text-sm font-medium mb-2 block">
                                      Description *
                                    </label>
                                    <Input
                                      placeholder="Item description"
                                      value={item.description}
                                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                                      required
                                    />
                                  </div>

                                  {/* Quantity */}
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-2 block">
                                      Quantity
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0.01"
                                      value={item.quantity}
                                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                    />
                                  </div>

                                  {/* Unit Price */}
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-2 block">
                                      Unit Price
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={item.unitPrice}
                                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                    />
                                  </div>

                                  {/* Tax Rate */}
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-2 block">
                                      Tax Rate (%)
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      value={item.taxRate}
                                      onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
                                    />
                                  </div>

                                  {/* Discount */}
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-2 block">
                                      Discount (%)
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      value={item.discount}
                                      onChange={(e) => updateItem(index, 'discount', e.target.value)}
                                    />
                                  </div>

                                  {/* Total and Actions */}
                                  <div className="md:col-span-3 flex items-center justify-between">
                                    <div>
                                      <span className="text-sm text-gray-500">Total:</span>
                                      <div className="font-semibold">
                                        ${calculateItemTotal(item).toFixed(2)}
                                      </div>
                                    </div>
                                    {items.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Additional Charges and Totals */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="taxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Tax Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Discount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="CAD">CAD ($)</SelectItem>
                            <SelectItem value="AUD">AUD ($)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Totals Summary */}
                <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Invoice Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Items Subtotal</span>
                      <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Additional Tax</span>
                      <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Additional Discount</span>
                      <span className="font-medium text-emerald-600">-${totals.discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-lg text-blue-600">${totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter payment terms, delivery terms, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Internal)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Internal notes about this invoice"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
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
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </div>
                ) : (
                  mode === 'create' ? 'Create Invoice' : 'Update Invoice'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};