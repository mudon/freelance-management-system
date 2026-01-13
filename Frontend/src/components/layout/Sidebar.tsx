import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  ChevronRight, 
  X, 
  Settings, 
  LogOut,
  Home,
  Users,
  Receipt,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigation } from '@/utils/constants';
import { useLogout } from '@/hooks/useAuth';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  // Map navigation items to icons
  const iconMap = {
    dashboard: Home,
    clients: Users,
    projects: Briefcase,
    invoices: Receipt,
    quotes: FileText,
  };

  const logoutMutation = useLogout();

  return (
    <>
      {/* Sidebar - Desktop - Compact Version */}
      <div className="hidden lg:flex lg:flex-col lg:w-20 xl:w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 shadow-xl z-40 transition-all duration-300 hover:w-64 group">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="xl:block hidden group-hover:block transition-all duration-300">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
                FreelanceHub
              </h1>
              <p className="text-xs text-gray-500 truncate">Manage business</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = iconMap[item.id as keyof typeof iconMap] || Briefcase;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                  ${isActive ? 'shadow-md text-white' : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-sm'}
                `}
                end={item.id === 'dashboard'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color}`} />
                    )}
                    <div className={`p-2 rounded-lg z-10 transition-transform duration-300 ${isActive ? 'bg-white/20 shadow-sm' : 'bg-gray-50'} flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <span className={`font-medium z-10 whitespace-nowrap xl:block hidden group-hover:block transition-all duration-300 ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto z-10 text-white/80 xl:block hidden group-hover:block" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                JF
              </div>
              <div className="xl:block hidden group-hover:block transition-all duration-300">
                <p className="font-semibold text-gray-900 text-sm truncate">John Freelancer</p>
                <p className="text-xs text-gray-500 truncate">john@freelance.com</p>
              </div>
            </div>
          </div>
          
          {/* Settings and Logout buttons - only visible on hover/expanded */}
          <div className="mt-4 space-y-1 xl:block hidden group-hover:block">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-gray-600">
                  <Settings className="h-4 w-4" />
                  Settings
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => {logoutMutation.mutate()}}
                disabled={logoutMutation.isPending}
              >
                  <LogOut className="h-4 w-4" />
                  <span className="whitespace-nowrap">
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </span>
              </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-72 h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">FreelanceHub</h1>
                  <p className="text-xs text-gray-500">Manage your business</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {navigation.map((item) => {
                const Icon = iconMap[item.id as keyof typeof iconMap] || Briefcase;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    end={item.id === 'dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-100 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                  JF
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">John Freelancer</p>
                  <p className="text-xs text-gray-500">john@freelance.com</p>
                </div>
              </div>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-gray-600">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => {logoutMutation.mutate()}}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="whitespace-nowrap">
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};