import React, { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  timeout?: number; // Allow customizable timeout duration
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ timeout}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, timeout);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [timeout]); // Ensure timeout is respected

  if (!isLoading) {
    return null; // Hide spinner when loading is done
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="relative flex items-center justify-center">
        {/* Rocket Spinner */}
        <div className="text-4xl animate-spin">🚀</div>
        {/* Rounded Spinner */}
        <div className="absolute w-16 h-16 border-4 border-t-blue-500 border-b-transparent border-l-blue-500 border-r-transparent rounded-full animate-spin-fast"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
