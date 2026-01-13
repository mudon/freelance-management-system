import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area - Full Width on Desktop */}
      <div className="lg:ml-20 xl:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <TopBar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Content takes full width */}
        <div className="flex-1 overflow-auto w-full">
          <Outlet /> {/* This is where child routes will render */}
        </div>

        {/* Footer - Full Width */}
        <div className="border-t border-gray-100 px-6 py-4 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 max-w-screen-2xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-3 md:mb-0">
              <Heart className="h-4 w-4 text-rose-400" />
              <span>© 2024 FreelanceHub. Professional freelancing platform.</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:text-gray-700 transition-colors hover:underline">Privacy Policy</button>
              <button className="hover:text-gray-700 transition-colors hover:underline">Terms of Service</button>
              <button className="hover:text-gray-700 transition-colors hover:underline">Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};