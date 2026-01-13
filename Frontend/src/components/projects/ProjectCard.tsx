import React from 'react';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronRight,
  User,
  Tag,
  MoreVertical
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
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onUpdateStatus?: (projectId: string, status: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_hold':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBillingType = () => {
    if (project.hourlyRate) {
      return `$${project.hourlyRate}/hr`;
    } else if (project.fixedPrice) {
      return `$${project.fixedPrice}`;
    }
    return 'Not set';
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" />
                {project.clientName}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(project)}>
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  Edit
                </DropdownMenuItem>
              )}
              {project.status !== 'completed' && onUpdateStatus && (
                <DropdownMenuItem onClick={() => onUpdateStatus(project.id, 'completed')}>
                  Mark as Completed
                </DropdownMenuItem>
              )}
              {project.status !== 'on_hold' && onUpdateStatus && (
                <DropdownMenuItem onClick={() => onUpdateStatus(project.id, 'on_hold')}>
                  Put On Hold
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(project.id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {project.description || 'No description provided'}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Budget</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {getBillingType()}
            </span>
          </div>

          {project.startDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Start Date</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.startDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {project.dueDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due Date</span>
              <span className={`font-medium ${new Date(project.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'} flex items-center gap-1`}>
                <Clock className="h-3 w-3" />
                {new Date(project.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {project.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-gray-900">{project.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200/50 flex items-center justify-between">
        <Badge className={`${getStatusColor(project.status)} capitalize`}>
          {project.status.replace('_', ' ')}
        </Badge>

        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(project)}
            className="group/btn"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};