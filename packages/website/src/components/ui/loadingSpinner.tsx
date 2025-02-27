"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  showText?: boolean;
  message?: string;
}

export default function LoadingSpinner({ 
  showText = true,
  message = "Loading..."
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState("");
  
  // Animate the loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={"flex flex-col items-center justify-center fixed inset-0 z-50 bg-cbackground-light/95"}>
      <div className="relative">
        {/* Main spinner */}
        <div className={"w-16 h-16 border-4 text-lg rounded-full border-cprimary-light/20 border-t-cprimary-light animate-spin"}></div>
        
        {/* Overlay spinner for double-ring effect */}
        <div className={"absolute top-0 left-0 w-16 h-16 border-4 text-lg rounded-full border-csecondary-light/10 border-r-csecondary-light animate-spin-slower opacity-70"}></div>
      </div>
      
      {showText && (
        <p className={"mt-4 text-ctext-light w-16 h-16 border-4 text-lg font-medium flex items-center"}>
          <span>{message}</span>
          <span className="inline-block w-7 text-left">{dots}</span>
        </p>
      )}
    </div>
  );
}