import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="p-8">
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
};