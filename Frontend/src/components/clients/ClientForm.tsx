import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, User, Building, Mail, Phone, MapPin, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { CreateClientRequest, UpdateClientRequest } from '@/types/client';

// Validation schema using Zod
const clientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  clientCategory: z.enum(['recurring', 'one-time', 'prospect', 'high-value', 'low-value']).nullable().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  initialData?: CreateClientRequest | UpdateClientRequest;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isLoading = false,
}) => {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      clientCategory: null,
      notes: '',
    },
  });

useEffect(() => {
  if (initialData && isOpen) {
    reset(initialData as ClientFormData);
  } else {
    reset();
  }
}, [initialData, isOpen, reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      await onSubmit(data);
      reset();
      setLogo(null);
      setLogoPreview(null);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const clientCategory = watch('clientCategory');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {mode === 'create' ? 'Add New Client' : 'Edit Client'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Logo Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="h-28 w-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <Building className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full cursor-pointer hover:from-blue-600 hover:to-cyan-500 shadow-lg">
                  <Upload className="h-4 w-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                {logoPreview && (
                  <button type="button" onClick={handleRemoveLogo} className="p-2 bg-gradient-to-r from-rose-500 to-pink-400 rounded-full shadow-lg hover:from-rose-600 hover:to-pink-500">
                    <X className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">Upload company logo (Optional, max 5MB)</p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Info */}
            <div className="space-y-4">
              <InputField label="Company Name" icon={<Building />} {...register('companyName')} error={errors.companyName} placeholder="Acme Corp" required />
              <InputField label="Contact Name" icon={<User />} {...register('contactName')} error={errors.contactName} placeholder="John Doe" required />
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4" /> Client Category
                </Label>
                <Select
                  value={clientCategory || 'none'}
                  onValueChange={(value) => setValue('clientCategory', value === 'none' ? undefined : (value as any))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    <SelectItem value="recurring">Recurring Client</SelectItem>
                    <SelectItem value="one-time">One-time Client</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="high-value">High Value</SelectItem>
                    <SelectItem value="low-value">Low Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <InputField label="Email" icon={<Mail />} {...register('email')} error={errors.email} placeholder="contact@company.com" />
              <InputField label="Phone" icon={<Phone />} {...register('phone')} placeholder="+1 (555) 123-4567" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Address Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Street Address" {...register('address')} />
              <InputField label="City" {...register('city')} />
              <InputField label="State / Province" {...register('state')} />
              <InputField label="Country" {...register('country')} />
              <InputField label="Postal Code" {...register('postalCode')} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Additional Notes
            </Label>
            <Textarea placeholder="Enter additional notes..." {...register('notes')} className="min-h-[100px]" />
            <p className="text-sm text-gray-500">This information is only visible to you and your team.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg" disabled={isLoading}>
              {isLoading ? 'Submitting...' : mode === 'create' ? 'Create Client' : 'Update Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Reusable InputField component
const InputField = ({ label, icon, error, required, ...props }: any) => (
  <div>
    <Label className="flex items-center gap-2 mb-1">{icon} {label}{required && ' *'}</Label>
    <Input {...props} className={error ? 'border-rose-500 focus:border-rose-500' : ''} />
    {error && <p className="text-rose-600 text-sm mt-1">{error.message}</p>}
  </div>
);
