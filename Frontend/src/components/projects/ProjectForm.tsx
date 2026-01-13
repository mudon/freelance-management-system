import React, { useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useClients } from '@/hooks/useClients';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project';

const formSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Project name is required'),
  status: z.enum(['active', 'completed', 'on_hold', 'cancelled']),
  billingType: z.enum(['hourly', 'fixed']),
  description: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  fixedPrice: z.number().min(0).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  dueDate: z.date().optional(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => void;
  initialData?: Project;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isLoading = false,
}) => {
  const { data: clientsData } = useClients(0, 100);
  const clients = clientsData?.content || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        clientId: '',
        name: '',
        description: '',
        status: 'active',
        billingType: 'fixed',
        hourlyRate: undefined,
        fixedPrice: undefined,
        startDate: undefined,
        endDate: undefined,
        dueDate: undefined,
        tags: [],
    },
    });

  useEffect(() => {
    if (initialData) {
      const billingType = initialData.hourlyRate ? 'hourly' : 'fixed';
      form.reset({
        clientId: initialData.clientId,
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
        billingType,
        hourlyRate: initialData.hourlyRate || undefined,
        fixedPrice: initialData.fixedPrice || undefined,
        startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
        endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined,
        tags: initialData.tags || [],
      });
    } else {
      form.reset({
        clientId: '',
        name: '',
        description: '',
        status: 'active',
        billingType: 'fixed',
        hourlyRate: undefined,
        fixedPrice: undefined,
        startDate: undefined,
        endDate: undefined,
        dueDate: undefined,
        tags: [],
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: FormValues) => {
    const submitData: any = {
      clientId: values.clientId,
      name: values.name,
      description: values.description,
    };

    if (values.billingType === 'hourly') {
      submitData.hourlyRate = values.hourlyRate;
    } else {
      submitData.fixedPrice = values.fixedPrice;
    }

    if (values.startDate) {
      submitData.startDate = format(values.startDate, 'yyyy-MM-dd');
    }
    if (values.endDate) {
      submitData.endDate = format(values.endDate, 'yyyy-MM-dd');
    }
    if (values.dueDate) {
      submitData.dueDate = format(values.dueDate, 'yyyy-MM-dd');
    }

    if (values.tags && values.tags.length > 0) {
      submitData.tags = values.tags;
    }

    // For edit mode, include status if changed
    if (mode === 'edit' && initialData?.status !== values.status) {
      submitData.status = values.status;
    }

    onSubmit(submitData);
  };

  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !form.getValues('tags').includes(tagInput.trim())) {
      const currentTags = form.getValues('tags');
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const billingType = form.watch('billingType');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {billingType === 'hourly' ? (
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="fixedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fixed Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
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
                          disabled={(date) => date < new Date('1900-01-01')}
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
                    <FormLabel>Due Date</FormLabel>
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
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        Add
                      </Button>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </div>
                ) : (
                  mode === 'create' ? 'Create Project' : 'Update Project'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};