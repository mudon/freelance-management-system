import React, { useState } from 'react';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical, 
  Eye, 
  Edit, 
  Archive, 
  Trash2,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Client } from '@/types/client';
import { useNavigate } from 'react-router-dom';

interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onArchive: (clientId: string) => void;
  onRestore: (clientId: string) => void;
  onDelete: (clientId: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onView,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status) {
        case 'active':
            return 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200';
        case 'archived':
            return 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-600 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category?: string) => {
        switch (category) {
        case 'recurring':
            return 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-200';
        case 'high-value':
            return 'bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-200';
        case 'prospect':
            return 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200';
        default:
            return 'bg-gray-100 text-gray-800';
        }
    };

    const handleView = () => {
        navigate(`/clients/${client.id}`);
    };

    return (
        <Card
        className={`transition-all duration-300 hover:shadow-lg border ${
            isHovered ? 'border-blue-200' : 'border-gray-200'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
        <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-sm">
                <Building className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                <h3 className="text-lg font-semibold text-gray-900">{client.companyName}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getStatusColor(client.status)}>
                    {client.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {client.status}
                    </Badge>
                    {client.clientCategory && (
                    <Badge variant="outline" className={getCategoryColor(client.clientCategory)}>
                        {client.clientCategory}
                    </Badge>
                    )}
                </div>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(client)} className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(client)} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Client
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {client.status === 'active' ? (
                    <DropdownMenuItem
                    onClick={() => onArchive(client.id)}
                    className="cursor-pointer text-amber-600"
                    >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Client
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                    onClick={() => onRestore(client.id)}
                    className="cursor-pointer text-emerald-600"
                    >
                    <Archive className="h-4 w-4 mr-2" />
                    Restore Client
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => onDelete(client.id)}
                    className="cursor-pointer text-rose-600"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Client
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>

            <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm">{client.contactName}</span>
            </div>

            {client.email && (
                <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <a
                    href={`mailto:${client.email}`}
                    className="text-sm hover:text-blue-600 transition-colors"
                >
                    {client.email}
                </a>
                </div>
            )}

            {client.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <a
                    href={`tel:${client.phone}`}
                    className="text-sm hover:text-blue-600 transition-colors"
                >
                    {client.phone}
                </a>
                </div>
            )}

            {(client.city || client.country) && (
                <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                    {[client.city, client.state, client.country].filter(Boolean).join(', ')}
                </span>
                </div>
            )}

            {client.notes && (
                <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500 line-clamp-2">{client.notes}</p>
                </div>
            )}

            <div className="pt-3 border-t border-gray-100 text-xs text-gray-400">
                Added {new Date(client.createdAt).toLocaleDateString()}
            </div>
            </div>
        </CardContent>
        </Card>
  );
};