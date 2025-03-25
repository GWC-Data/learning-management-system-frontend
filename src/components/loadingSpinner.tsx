import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  timeout?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ timeout = 5000 }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), timeout);
    return () => clearTimeout(timer);
  }, [timeout]);

  if (!isLoading) return null;

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      {/* Circular Loader with Rocket Inside */}
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Spinning Border */}
        <div className="absolute w-20 h-20 border-4 border-t-transparent border-b-[#130342] border-l-transparent border-r-[#130342] rounded-full animate-spin"></div>
        {/* Rocket Inside Circle */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-3xl"
        >
          🚀
        </motion.div>
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-lg font-semibold tracking-widest text-white">
        Launching...
      </p>
    </div>
  );
};

export default LoadingSpinner;
