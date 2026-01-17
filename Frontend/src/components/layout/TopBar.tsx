import React from 'react';
import { Menu, Bell, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { navigation } from '@/utils/constants';
import { useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth';

interface TopBarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  setIsMobileMenuOpen
}) => {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => 
      location.pathname === nav.path || 
      (nav.path !== '/' && location.pathname.startsWith(nav.path))
    );
    
    return currentNav?.label || 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Overview of your business';
    if (path.startsWith('/clients')) {
      if (path.includes('/clients/')) {
        return 'View client details and history';
      }
      return 'Manage client relationships';
    }
    if (path.startsWith('/projects')) return 'Track ongoing work';
    if (path.startsWith('/invoices')) return 'Handle billing and payments';
    if (path.startsWith('/quotes')) return 'Create and send quotes';
    return '';
  };

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="hidden lg:block ml-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {getPageTitle()}
          </h2>
          <p className="text-sm text-gray-500">
            {getPageDescription()}
          </p>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:block ml-8 flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search anything..."
              className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 w-full"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Button - Mobile */}
        <Button variant="ghost" size="sm" className="lg:hidden p-2">
          <Search className="h-5 w-5 text-gray-600" />
        </Button>

        {/* Help Button */}
        <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-gray-600 hover:text-gray-900">
          <HelpCircle className="h-5 w-5" />
          <span className="hidden lg:inline">Help</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-gradient-to-r from-rose-500 to-pink-400 rounded-full animate-pulse"></span>
        </Button>

        {/* User Profile - Desktop */}
        <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            JF
          </div>
        </div>

        {/* User Profile - Mobile */}
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm lg:hidden">
          JF
        </div>
      </div>
    </div>
  );
};