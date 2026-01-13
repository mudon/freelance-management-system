import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-8">
      <div className="text-center max-w-lg">
        <div className="h-32 w-32 bg-gradient-to-r from-rose-500 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Home className="h-16 w-16 text-white" />
        </div>
        
        <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to familiar territory.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};